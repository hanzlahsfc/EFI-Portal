"use server";

import { redirect } from "next/navigation";
import { courseBySlug } from "@/lib/catalog";
import { queueClassReminders } from "@/lib/progress";
import { hashPassword, randomId, verifyPassword } from "@/lib/codec";
import type { EnrollmentStatus } from "@/lib/types";
import { emailTaken, nextRoll, writeDb } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { cleanCnic, cleanEmail, cleanName, cleanPassword, cleanPhone } from "@/lib/validate";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createStudent(formData: FormData) {
  await requireUser("staff");
  const fullName = cleanName(formData.get("fullName"));
  const email = cleanEmail(formData.get("email"));
  const phone = cleanPhone(formData.get("phone"));
  const cnic = cleanCnic(formData.get("cnic"));
  const batchId = String(formData.get("batchId") ?? "");
  if (!fullName || !email || !phone || cnic === null) fail("/admin/students/new", "Check the name, email, phone, and CNIC.");

  const id = randomId(9);
  const error = await writeDb((db) => {
    if (emailTaken(db, email)) return "That email is already on the roll.";
    const batch = db.batches.find((item) => item.id === batchId);
    if (!batch || !courseBySlug(batch.courseSlug)) return "Choose a batch.";
    const taken = db.enrollments.filter((item) => item.batchId === batch.id && item.status !== "withdrawn").length;
    if (taken >= batch.seats) return "That batch is full.";
    db.users.push({
      id,
      role: "student",
      fullName,
      email,
      phone,
      cnic,
      rollNumber: nextRoll(db),
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
      courseSlug: batch.courseSlug,
      batchId: batch.id,
      status: "invited",
      shopifyOrderId: null,
      enrolledAt: new Date().toISOString(),
    });
    return null;
  });
  if (error) fail("/admin/students/new", error);
  redirect(`/admin/students/${id}`);
}

export async function updateStudent(formData: FormData) {
  await requireUser("staff");
  const id = String(formData.get("id") ?? "");
  const fullName = cleanName(formData.get("fullName"));
  const email = cleanEmail(formData.get("email"));
  const phone = cleanPhone(formData.get("phone"));
  const cnic = cleanCnic(formData.get("cnic"));
  const batchId = String(formData.get("batchId") ?? "");
  const status = String(formData.get("status") ?? "") as EnrollmentStatus;
  const allowed: EnrollmentStatus[] = ["invited", "active", "completed", "withdrawn"];
  if (!fullName || !email || !phone || cnic === null || !allowed.includes(status)) {
    fail(`/admin/students/${id}`, "Check the student details.");
  }

  const error = await writeDb((db) => {
    const user = db.users.find((item) => item.id === id && item.role === "student");
    const batch = db.batches.find((item) => item.id === batchId);
    if (!user || !batch) return "That student or batch was not found.";
    if (emailTaken(db, email, user.id)) return "That email is already on the roll.";
    user.fullName = fullName;
    user.email = email;
    user.phone = phone;
    user.cnic = cnic;
    user.batchId = batch.id;
    const enrollment = db.enrollments.find((item) => item.userId === user.id);
    if (enrollment) {
      enrollment.batchId = batch.id;
      enrollment.courseSlug = batch.courseSlug;
      enrollment.status = status;
    }
    return null;
  });
  if (error) fail(`/admin/students/${id}`, error);
  redirect(`/admin/students/${id}?notice=Saved`);
}

export async function createBatch(formData: FormData) {
  await requireUser("staff");
  const name = cleanName(formData.get("name"));
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const days = String(formData.get("days") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const seats = Number(formData.get("seats"));
  if (!name || !courseBySlug(courseSlug) || !days || !time || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || seats < 1) {
    fail("/admin/batches", "Check the batch name, course, dates, and seats.");
  }
  await writeDb((db) => {
    db.batches.push({ id: randomId(8), courseSlug, name, days, time, startDate, endDate, seats });
  });
  redirect("/admin/batches?notice=Batch+added");
}

export async function changeStaffPassword(formData: FormData) {
  const user = await requireUser("staff");
  const current = String(formData.get("current") ?? "");
  const next = cleanPassword(formData.get("next"));
  if (!next) fail("/admin/account", "Use at least 8 characters.");
  const error = await writeDb(async (db) => {
    const staff = db.users.find((item) => item.id === user.id);
    if (!staff || !(await verifyPassword(current, staff.passwordHash))) return "The current password does not match.";
    staff.passwordHash = await hashPassword(next);
    return null;
  });
  if (error) fail("/admin/account", error);
  redirect("/admin/account?notice=Password+updated");
}

export async function issueCertificate(formData: FormData) {
  await requireUser("staff");
  const id = String(formData.get("id") ?? "");
  const error = await writeDb((db) => {
    const user = db.users.find((item) => item.id === id && item.role === "student");
    const enrollment = db.enrollments.find((item) => item.userId === id);
    if (!user?.rollNumber || !enrollment) return "That student is not on a course.";
    if (enrollment.status === "invited" || enrollment.status === "withdrawn") {
      return "Issue a certificate only after the student is active or completed.";
    }
    if (db.certificates.some((item) => item.userId === user.id)) return null;
    const course = courseBySlug(enrollment.courseSlug);
    const digits = user.rollNumber.replace(/\D/g, "");
    db.certificates.push({
      id: randomId(9),
      userId: user.id,
      enrollmentId: enrollment.id,
      rollNumber: user.rollNumber,
      studentName: user.fullName,
      courseName: course?.name ?? enrollment.courseSlug,
      issuedAt: new Date().toISOString(),
      serial: `EFI-C-${digits}`,
    });
    enrollment.status = "completed";
    return null;
  });
  if (error) fail(`/admin/students/${id}`, error);
  redirect(`/admin/students/${id}?notice=Certificate+issued`);
}

export async function saveProgress(formData: FormData) {
  await requireUser("staff");
  const id = String(formData.get("id") ?? "");
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  const moduleIds = formData.getAll("moduleId").map(String);
  const completed = new Set(formData.getAll("completed").map(String));
  const error = await writeDb((db) => {
    const enrollment = db.enrollments.find((item) => item.id === enrollmentId && item.userId === id);
    if (!enrollment) return "That enrollment was not found.";
    for (const moduleId of moduleIds) {
      const raw = String(formData.get(`score-${moduleId}`) ?? "").trim();
      let testScore: number | null = null;
      if (raw) {
        testScore = Number(raw);
        if (!Number.isFinite(testScore) || testScore < 0 || testScore > 100) return "Test scores are from 0 to 100.";
      }
      const row = db.progress.find((item) => item.enrollmentId === enrollmentId && item.moduleId === moduleId);
      if (!row) return "Progress for that module is missing.";
      const nowDone = completed.has(moduleId);
      if (nowDone && !row.completed) row.completedAt = new Date().toISOString();
      if (!nowDone) row.completedAt = null;
      row.completed = nowDone;
      row.testScore = testScore;
    }
    return null;
  });
  if (error) fail(`/admin/students/${id}`, error);
  redirect(`/admin/students/${id}?notice=Progress+saved`);
}

export async function sendClassReminders() {
  await requireUser("staff");
  const result = await writeDb((db) => queueClassReminders(db));
  redirect(`/admin/outbox?notice=${encodeURIComponent(`${result.queued} reminder${result.queued === 1 ? "" : "s"} queued for ${result.date}`)}`);
}
