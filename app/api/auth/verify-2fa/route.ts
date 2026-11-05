import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { checkOtp } from "@/lib/otp";
import { openTicket, pendingCookie, safeNext, seal, sessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const code = String(body?.code ?? "");
  const ticket = await openTicket(request.cookies.get(pendingCookie.name)?.value);
  if (!ticket || ticket.kind !== "pending") {
    return NextResponse.json({ error: "Sign in again. The code window has closed." }, { status: 401 });
  }

  const message = await writeDb((db) => checkOtp(db, ticket.uid, code));
  if (message) return NextResponse.json({ error: message }, { status: 401 });

  const user = await readDb((db) => db.users.find((item) => item.id === ticket.uid) ?? null);
  if (!user) return NextResponse.json({ error: "This account is no longer on the roll." }, { status: 401 });

  const requested = safeNext(typeof body?.next === "string" ? body.next : null, user.role === "staff" ? "/admin" : "/portal");
  const dest = user.role === "staff"
    ? (requested.startsWith("/admin") ? requested : "/admin")
    : (requested.startsWith("/portal") ? requested : "/portal");

  const session = await seal({
    uid: user.id,
    role: user.role,
    kind: "session",
    exp: Date.now() + sessionCookie.maxAge * 1000,
  });
  const response = NextResponse.json({ ok: true, redirect: dest });
  response.cookies.set(sessionCookie.name, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionCookie.maxAge,
  });
  response.cookies.set(pendingCookie.name, "", { path: "/", maxAge: 0 });
  return response;
}
