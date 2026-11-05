import { generateRegistrationOptions } from "@simplewebauthn/server";
import { NextRequest, NextResponse } from "next/server";
import { randomId } from "@/lib/codec";
import { writeDb } from "@/lib/db";
import { readSession } from "@/lib/session";
import { rpConfig } from "@/lib/webauthn";

export async function POST(request: NextRequest) {
  const session = await readSession(request.cookies.get("efi_session")?.value);
  if (!session) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { rpID, rpName } = rpConfig(request);

  const prepared = await writeDb(async (db) => {
    const user = db.users.find((item) => item.id === session.uid);
    if (!user) return null;
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: user.email,
      userDisplayName: user.fullName,
      userID: new TextEncoder().encode(user.id),
      attestationType: "none",
      excludeCredentials: db.passkeys
        .filter((item) => item.userId === user.id)
        .map((item) => ({ id: item.credentialId })),
      authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
    });
    const id = randomId(12);
    db.challenges.push({
      id,
      kind: "register",
      userId: user.id,
      challenge: options.challenge,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
    return { options, id };
  });

  if (!prepared) return NextResponse.json({ error: "This account is no longer on the roll." }, { status: 401 });
  const response = NextResponse.json(prepared.options);
  response.cookies.set("efi_pk", prepared.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 300,
  });
  return response;
}
