import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSession } from "@/lib/session";

function hostArea(host: string): "student" | "admin" | null {
  if (host.startsWith("student.")) return "student";
  if (host.startsWith("admin.") || host.startsWith("staff.")) return "admin";
  return null;
}

const PROTECTED = ["/portal", "/admin"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const host = request.headers.get("host") || "";
  const area = hostArea(host);
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  // Host routing: subdomain roots land on their app area.
  if (area && path === "/") {
    return NextResponse.redirect(new URL(area === "admin" ? "/admin" : "/portal", request.url));
  }
  // Keep the wrong surface off each subdomain.
  if (area === "student" && path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }
  if (area === "admin" && path.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!isProtected) return NextResponse.next();

  const session = await readSession(request.cookies.get("efi_session")?.value);
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

export const config = { matcher: ["/", "/login", "/onboard/:path*", "/portal/:path*", "/admin/:path*"] };
