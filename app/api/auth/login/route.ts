import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/codec";
import { writeDb } from "@/lib/db";
import { issueOtp, sendSignInCode } from "@/lib/otp";
import { pendingCookie, seal } from "@/lib/session";
import type { User } from "@/lib/types";

const hits = new Map<string, { n: number; at: number }>();

function limited(email: string) {
  const now = Date.now();
  const row = hits.get(email);
  if (!row || now - row.at > 10 * 60 * 1000) {
    hits.set(email, { n: 1, at: now });
    return false;
  }
  row.n += 1;
  return row.n > 8;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  if (limited(email)) {
    return NextResponse.json({ error: "Too many attempts. Wait a few minutes and try again." }, { status: 429 });
  }

  const result = await writeDb(async (db): Promise<{ error: string } | { user: User; code: string }> => {
    const user = db.users.find((item) => item.email.toLowerCase() === email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return { error: "Those details do not match an EFI account." };
    }
    if (user.role === "student" && !user.onboarded) {
      return { error: "Scan your onboarding QR and set a password before signing in." };
    }
    const code = await issueOtp(db, user);
    return { user, code };
  });

  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });

  const delivery = await sendSignInCode(result.user.email, result.code);
  if (delivery.delivered === "failed" || delivery.delivered === "unconfigured") {
    return NextResponse.json({ error: "The sign-in email could not be sent. Ask the institute to check the mail setup." }, { status: 503 });
  }

  const token = await seal({
    uid: result.user.id,
    role: result.user.role,
    kind: "pending",
    exp: Date.now() + pendingCookie.maxAge * 1000,
  });
  const response = NextResponse.json({
    ok: true,
    demoCode: delivery.delivered === "demo" ? result.code : undefined,
  });
  response.cookies.set(pendingCookie.name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: pendingCookie.maxAge,
  });
  return response;
}
