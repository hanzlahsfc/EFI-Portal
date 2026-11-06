import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hostArea(host: string): "student" | "admin" | null {
  if (host.startsWith("student.")) return "student";
  if (host.startsWith("admin.") || host.startsWith("staff.")) return "admin";
  return null;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const host = request.headers.get("host") || "";
  const area = hostArea(host);

  if (area && path === "/") {
    return NextResponse.redirect(new URL(area === "admin" ? "/admin" : "/portal", request.url));
  }
  if (area === "student" && (path === "/admin" || path.startsWith("/admin/"))) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }
  if (area === "admin" && (path === "/portal" || path.startsWith("/portal/"))) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/", "/portal/:path*", "/admin/:path*"] };
