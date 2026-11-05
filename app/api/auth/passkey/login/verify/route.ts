import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { NextRequest, NextResponse } from "next/server";
import { base64UrlToBytes } from "@/lib/codec";
import { writeDb } from "@/lib/db";
import { seal, sessionCookie } from "@/lib/session";
import { rpConfig } from "@/lib/webauthn";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const challengeId = request.cookies.get("efi_pk")?.value;
  if (!body || !challengeId) return NextResponse.json({ error: "The passkey challenge expired. Try again." }, { status: 400 });

  const { origin, rpID } = rpConfig(request);
  const outcome = await writeDb(async (db) => {
    const challenge = db.challenges.find((item) => item.id === challengeId && item.kind === "login");
    db.challenges = db.challenges.filter((item) => item.id !== challengeId);
    if (!challenge || Date.parse(challenge.expiresAt) < Date.now()) return { error: "The passkey challenge expired. Try again." };
    const passkey = db.passkeys.find((item) => item.credentialId === body.id);
    if (!passkey) return { error: "This passkey is not registered on an EFI account." };
    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: challenge.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: passkey.credentialId,
          publicKey: base64UrlToBytes(passkey.publicKey),
          counter: passkey.counter,
        },
      });
    } catch (error) {
      console.error(error);
      return { error: "The passkey could not be verified." };
    }
    if (!verification.verified) return { error: "The passkey could not be verified." };
    passkey.counter = verification.authenticationInfo.newCounter;
    const user = db.users.find((item) => item.id === passkey.userId);
    if (!user) return { error: "This account is no longer on the roll." };
    return { user };
  });

  if ("error" in outcome) return NextResponse.json({ error: outcome.error }, { status: 401 });
  const session = await seal({
    uid: outcome.user.id,
    role: outcome.user.role,
    kind: "session",
    exp: Date.now() + sessionCookie.maxAge * 1000,
  });
  const response = NextResponse.json({
    ok: true,
    redirect: outcome.user.role === "staff" ? "/admin" : "/portal",
  });
  response.cookies.set(sessionCookie.name, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionCookie.maxAge,
  });
  response.cookies.set("efi_pk", "", { path: "/", maxAge: 0 });
  return response;
}
