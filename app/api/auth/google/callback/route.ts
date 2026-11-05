import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { issueOtp, sendSignInCode } from "@/lib/otp";
import { demoMode, pendingCookie, seal, siteOrigin } from "@/lib/session";

export async function GET(request: NextRequest) {
  const origin = siteOrigin(request);
  const fail = (message: string) => NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, origin));
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expected = request.cookies.get("efi_oauth")?.value;
  if (!code || !state || !expected || state !== expected) return fail("Google sign-in was interrupted. Try again.");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("Google sign-in is not configured yet.");

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  const token = await tokenResponse.json().catch(() => null) as { access_token?: string } | null;
  if (!tokenResponse.ok || !token?.access_token) return fail("Google did not return a sign-in token.");

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const profile = await profileResponse.json().catch(() => null) as { email?: string } | null;
  const email = profile?.email?.trim().toLowerCase();
  if (!email) return fail("Google did not share an email address.");

  const user = await readDb((db) => db.users.find((item) => item.email.toLowerCase() === email) ?? null);
  if (!user) return fail("This Google account is not on the EFI roll. Use the QR from the institute.");
  if (user.role === "student" && !user.onboarded) return fail("Scan your onboarding QR and set a password before using Google.");

  const otp = await writeDb(async (db) => {
    const current = db.users.find((item) => item.id === user.id);
    if (!current) return null;
    return issueOtp(db, current);
  });
  if (!otp) return fail("This account is no longer on the roll.");

  const delivery = await sendSignInCode(user.email, otp);
  if (delivery.delivered === "failed" || delivery.delivered === "unconfigured") {
    return fail("Google matched your account, but the email code could not be sent.");
  }

  const pending = await seal({
    uid: user.id,
    role: user.role,
    kind: "pending",
    exp: Date.now() + pendingCookie.maxAge * 1000,
  });
  const response = NextResponse.redirect(new URL("/login?step=2fa", origin));
  response.cookies.set("efi_oauth", "", { path: "/", maxAge: 0 });
  response.cookies.set(pendingCookie.name, pending, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: pendingCookie.maxAge,
  });
  if (delivery.delivered === "demo" && demoMode()) {
    response.cookies.set("efi_demo_code", otp, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    });
  }
  return response;
}
