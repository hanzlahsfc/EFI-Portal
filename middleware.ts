import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const session = await readSession(request.cookies.get("efi_session")?.value);
  const path = request.nextUrl.pathname;
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  if (path.startsWith("/admin") && session.role !== "staff") {
    return NextResponse.redirect(new URL("/portal", request.url));
  }
  if (path.startsWith("/portal") && session.role !== "student") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/portal/:path*", "/admin/:path*"] };
