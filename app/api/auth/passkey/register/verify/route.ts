import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { NextRequest, NextResponse } from "next/server";
import { bytesToBase64Url, randomId } from "@/lib/codec";
import { writeDb } from "@/lib/db";
import { readSession } from "@/lib/session";
import { rpConfig } from "@/lib/webauthn";

export async function POST(request: NextRequest) {
  const session = await readSession(request.cookies.get("efi_session")?.value);
  const challengeId = request.cookies.get("efi_pk")?.value;
  const body = await request.json().catch(() => null);
  if (!session || !challengeId || !body) {
    return NextResponse.json({ error: "The passkey challenge expired. Try again." }, { status: 400 });
  }
  const { origin, rpID } = rpConfig(request);
  const deviceName = String(body.deviceName ?? "This device").slice(0, 60) || "This device";

  const error = await writeDb(async (db) => {
    const challenge = db.challenges.find((item) => item.id === challengeId && item.kind === "register" && item.userId === session.uid);
    db.challenges = db.challenges.filter((item) => item.id !== challengeId);
    if (!challenge || Date.parse(challenge.expiresAt) < Date.now()) return "The passkey challenge expired. Try again.";
    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: challenge.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (caught) {
      console.error(caught);
      return "The passkey could not be registered.";
    }
    if (!verification.verified || !verification.registrationInfo) return "The passkey could not be registered.";
    const credential = verification.registrationInfo.credential;
    db.passkeys.push({
      id: randomId(9),
      userId: session.uid,
      credentialId: credential.id,
      publicKey: bytesToBase64Url(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports ?? [],
      deviceName,
      createdAt: new Date().toISOString(),
    });
    return null;
  });

  if (error) return NextResponse.json({ error }, { status: 400 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("efi_pk", "", { path: "/", maxAge: 0 });
  return response;
}
