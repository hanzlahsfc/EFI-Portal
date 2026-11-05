import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { readDb } from "@/lib/db";
import { siteOrigin } from "@/lib/session";

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const user = await readDb((db) => db.users.find((item) => item.qrToken === token && item.role === "student") ?? null);
  if (!user) return new NextResponse("Not found", { status: 404 });
  const png = await QRCode.toBuffer(`${siteOrigin(request)}/onboard/${encodeURIComponent(token)}`, {
    width: 480,
    margin: 1,
    color: { dark: "#15171B", light: "#FFFFFF" },
  });
  return new NextResponse(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=300" },
  });
}
