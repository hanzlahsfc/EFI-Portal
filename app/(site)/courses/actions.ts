"use server";

import { redirect } from "next/navigation";
import { courseBySlug } from "@/lib/catalog";
import { randomId } from "@/lib/codec";
import { emailTaken, nextRoll, writeDb } from "@/lib/db";
import { karachiToday } from "@/lib/progress";
import { cleanEmail, cleanName, cleanPhone } from "@/lib/validate";

export async function requestSeat(formData: FormData) {
  const slug = String(formData.get("courseSlug") ?? "");
  const course = courseBySlug(slug);
  if (!course) redirect("/courses");
  const fullName = cleanName(formData.get("fullName"));
  const email = cleanEmail(formData.get("email"));
  const phone = cleanPhone(formData.get("phone"));
  if (!fullName || !email || !phone) {
    redirect(`/courses/${slug}?error=${encodeURIComponent("Enter your name, a valid email, and a phone number.")}#enroll`);
  }
  const seatCourse = course;
  const seatName = fullName;
  const seatEmail = email;
  const seatPhone = phone;

  const today = karachiToday();
  const created = await writeDb((db) => {
    if (emailTaken(db, seatEmail)) return { error: "That email is already on the roll. Sign in, or WhatsApp the desk." };
    const open = db.batches
      .filter((batch) => batch.courseSlug === seatCourse.slug && batch.endDate >= today)
      .filter((batch) => {
        const taken = db.enrollments.filter((item) => item.batchId === batch.id && item.status !== "withdrawn").length;
        return taken < batch.seats;
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const batch = open[0];
    if (!batch) return { error: "That course has no open seat. WhatsApp the desk and they will place you." };
    const id = randomId(9);
    const roll = nextRoll(db);
    db.users.push({
      id,
      role: "student",
      fullName: seatName,
      email: seatEmail,
      phone: seatPhone,
      cnic: "",
      rollNumber: roll,
      batchId: batch.id,
      qrToken: randomId(18),
      onboarded: false,
      passwordHash: null,
      shopifyCustomerId: null,
      createdAt: new Date().toISOString(),
    });
    db.enrollments.push({
      id: randomId(9),
      userId: id,
      courseSlug: seatCourse.slug,
      batchId: batch.id,
      status: "invited",
      shopifyOrderId: null,
      enrolledAt: new Date().toISOString(),
    });
    return { roll, batch: batch.name };
  });

  if ("error" in created && created.error) {
    redirect(`/courses/${slug}?error=${encodeURIComponent(created.error)}#enroll`);
  }
  const seat = created as { roll: string; batch: string };
  redirect(`/courses/${slug}?notice=${encodeURIComponent(`Seat requested in ${seat.batch}. Your roll number is ${seat.roll}. The desk will send your QR.`)}#enroll`);
}
