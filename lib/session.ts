import { bytesToBase64Url, base64UrlToBytes } from "@/lib/codec";
import type { Role } from "@/lib/types";

export type Ticket = {
  uid: string;
  role: Role;
  exp: number;
  kind: "session" | "pending";
};

const encoder = new TextEncoder();

function secret() {
  return process.env.SESSION_SECRET || "efi-dev-session-secret";
}

async function hmacKey() {
  return crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function seal(ticket: Ticket) {
  const body = bytesToBase64Url(encoder.encode(JSON.stringify(ticket)));
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${bytesToBase64Url(new Uint8Array(sig))}`;
}

export async function openTicket(token: string | undefined | null): Promise<Ticket | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const key = await hmacKey();
  const valid = await crypto.subtle.verify("HMAC", key, base64UrlToBytes(sig), encoder.encode(body));
  if (!valid) return null;
  try {
    const ticket = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as Ticket;
    if (!ticket.uid || !ticket.exp || ticket.exp < Date.now()) return null;
    return ticket;
  } catch {
    return null;
  }
}

export async function readSession(token: string | undefined | null) {
  const ticket = await openTicket(token);
  if (!ticket || ticket.kind !== "session") return null;
  return ticket;
}

export function safeNext(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export function demoMode() {
  return process.env.DEMO_MODE !== "0";
}

export function siteOrigin(request?: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (!request) return "http://localhost:3000";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}`;
}

export const sessionCookie = {
  name: "efi_session",
  maxAge: 60 * 60 * 24 * 12,
};

export const pendingCookie = {
  name: "efi_pending",
  maxAge: 60 * 10,
};
