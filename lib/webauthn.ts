import { siteOrigin } from "@/lib/session";

export function rpConfig(request: Request) {
  const origin = process.env.WEBAUTHN_ORIGIN || siteOrigin(request);
  const hostname = new URL(origin).hostname;
  return {
    rpName: "EFI Future Intelligence Institute",
    rpID: process.env.WEBAUTHN_RP_ID || hostname,
    origin,
  };
}
