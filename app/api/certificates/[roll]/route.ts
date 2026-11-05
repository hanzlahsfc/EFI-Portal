import { NextResponse } from "next/server";
import { renderCertificate } from "@/lib/certificate-pdf";
import { readDb } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ roll: string }> }) {
  const { roll } = await context.params;
  const cert = await readDb((db) => db.certificates.find((item) => item.rollNumber.toLowerCase() === decodeURIComponent(roll).toLowerCase()) ?? null);
  if (!cert) return new NextResponse("No certificate is filed under that roll number.", { status: 404 });
  const pdf = await renderCertificate(cert);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${cert.rollNumber}.pdf"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
