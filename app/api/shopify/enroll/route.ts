import { NextResponse } from "next/server";
import { randomId } from "@/lib/codec";
import { courseBySlug } from "@/lib/catalog";
import { emailTaken, nextRoll, writeDb } from "@/lib/db";

export async function POST(request: Request) {
  const secret = process.env.EFI_SHOPIFY_SECRET;
  if (!secret) return NextResponse.json({ error: "Shopify enrollment is not configured." }, { status: 503 });
  if (request.headers.get("x-efi-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const fullName = String(body?.fullName ?? body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const course = courseBySlug(String(body?.courseSlug ?? ""));
  const orderId = String(body?.orderId ?? "").trim() || null;
  if (!email.includes("@") || fullName.length < 3 || !course) {
    return NextResponse.json({ error: "Send email, fullName, and a known courseSlug." }, { status: 400 });
  }

  const result = await writeDb((db) => {
    let user = db.users.find((item) => item.email.toLowerCase() === email);
    if (!user) {
      if (emailTaken(db, email)) return { error: "Email already used." };
      user = {
        id: randomId(9),
        role: "student",
        fullName,
        email,
        phone,
        cnic: String(body?.cnic ?? ""),
        rollNumber: nextRoll(db),
        batchId: null,
        qrToken: randomId(18),
        onboarded: false,
        passwordHash: null,
        shopifyCustomerId: body?.customerId ? String(body.customerId) : null,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    }
    const batch = db.batches.find((item) => item.courseSlug === course.slug && item.id === user?.batchId)
      ?? db.batches.find((item) => item.courseSlug === course.slug);
    if (!batch) return { error: "No batch is open for that course." };
    user.batchId = batch.id;
    if (phone) user.phone = phone;
    let enrollment = db.enrollments.find((item) => item.userId === user?.id && item.courseSlug === course.slug);
    if (!enrollment) {
      enrollment = {
        id: randomId(9),
        userId: user.id,
        courseSlug: course.slug,
        batchId: batch.id,
        status: user.onboarded ? "active" : "invited",
        shopifyOrderId: orderId,
        enrolledAt: new Date().toISOString(),
      };
      db.enrollments.push(enrollment);
    } else if (orderId) {
      enrollment.shopifyOrderId = orderId;
    }
    return { rollNumber: user.rollNumber, status: enrollment.status, qrToken: user.qrToken };
  });

  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
