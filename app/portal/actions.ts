"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/codec";
import { writeDb } from "@/lib/db";
import { cleanPassword } from "@/lib/validate";

export async function changeStudentPassword(formData: FormData) {
  const user = await requireUser("student");
  const current = String(formData.get("current") ?? "");
  const next = cleanPassword(formData.get("next"));
  if (!next) redirect("/portal/account?error=Use+at+least+8+characters.");
  const error = await writeDb(async (db) => {
    const student = db.users.find((item) => item.id === user.id);
    if (!student || !(await verifyPassword(current, student.passwordHash))) return "The current password does not match.";
    student.passwordHash = await hashPassword(next);
    return null;
  });
  if (error) redirect(`/portal/account?error=${encodeURIComponent(error)}`);
  redirect("/portal/account?notice=Password+updated");
}

export async function activateFromQr(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = cleanPassword(formData.get("password"));
  const confirm = String(formData.get("confirm") ?? "");
  if (!password || password !== confirm) {
    redirect(`/onboard/${encodeURIComponent(token)}?error=${encodeURIComponent("Use a password of at least 8 characters, and match the confirmation.")}`);
  }
  const error = await writeDb(async (db) => {
    const user = db.users.find((item) => item.qrToken === token && item.role === "student");
    if (!user) return "This onboarding code is not on the roll.";
    if (user.onboarded) return "This account is already set up. Sign in instead.";
    user.passwordHash = await hashPassword(password);
    user.onboarded = true;
    for (const enrollment of db.enrollments) {
      if (enrollment.userId === user.id && enrollment.status === "invited") enrollment.status = "active";
    }
    return null;
  });
  if (error) redirect(`/onboard/${encodeURIComponent(token)}?error=${encodeURIComponent(error)}`);
  redirect("/login?notice=Account+ready.+Sign+in+with+the+password+you+just+set.");
}
