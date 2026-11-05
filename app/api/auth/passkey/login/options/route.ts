import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { NextResponse } from "next/server";
import { randomId } from "@/lib/codec";
import { writeDb } from "@/lib/db";
import { rpConfig } from "@/lib/webauthn";

export async function POST(request: Request) {
  const { rpID } = rpConfig(request);
  const options = await generateAuthenticationOptions({ rpID, userVerification: "preferred" });
  const id = randomId(12);
  await writeDb((db) => {
    db.challenges.push({
      id,
      kind: "login",
      userId: null,
      challenge: options.challenge,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
  });
  const response = NextResponse.json(options);
  response.cookies.set("efi_pk", id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 300,
  });
  return response;
}
