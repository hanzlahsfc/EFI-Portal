import { NextRequest, NextResponse } from "next/server";
import { demoMode } from "@/lib/session";

export async function GET(request: NextRequest) {
  if (!demoMode()) return NextResponse.json({ code: null });
  const code = request.cookies.get("efi_demo_code")?.value ?? null;
  const response = NextResponse.json({ code });
  if (code) response.cookies.set("efi_demo_code", "", { path: "/", maxAge: 0 });
  return response;
}
