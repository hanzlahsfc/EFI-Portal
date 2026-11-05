import { randomDigits, randomId, sha256 } from "@/lib/codec";
import type { Database, User } from "@/lib/types";

export async function issueOtp(db: Database, user: User) {
  const code = randomDigits(6);
  db.otps = db.otps.filter((otp) => otp.userId !== user.id);
  db.otps.push({
    id: randomId(9),
    userId: user.id,
    codeHash: await sha256(code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    attempts: 0,
    consumed: false,
  });
  return code;
}

export async function checkOtp(db: Database, userId: string, code: string) {
  const otp = db.otps.find((item) => item.userId === userId && !item.consumed);
  if (!otp || Date.parse(otp.expiresAt) < Date.now()) return "That code has expired. Sign in again.";
  otp.attempts += 1;
  if (otp.attempts > 5) {
    otp.consumed = true;
    return "Too many attempts. Sign in again.";
  }
  if ((await sha256(code.trim())) !== otp.codeHash) return "That code does not match.";
  otp.consumed = true;
  return null;
}

export async function sendSignInCode(email: string, code: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { delivered: process.env.DEMO_MODE === "0" ? "unconfigured" as const : "demo" as const };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "EFI Institute <onboarding@resend.dev>",
      to: email,
      subject: "Your EFI sign-in code",
      html: `<p>Your EFI sign-in code is <strong style="letter-spacing:4px">${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend failed", detail);
    return { delivered: "failed" as const };
  }
  return { delivered: "email" as const };
}
