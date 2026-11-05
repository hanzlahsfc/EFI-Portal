import { NextResponse } from "next/server";
import { siteOrigin } from "@/lib/session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", siteOrigin(request)), 303);
  response.cookies.set("efi_session", "", { path: "/", maxAge: 0 });
  response.cookies.set("efi_pending", "", { path: "/", maxAge: 0 });
  return response;
}
