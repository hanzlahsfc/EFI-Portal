import { courseBySlug, institute, modulesFor, type Course } from "@/lib/catalog";
import { randomId } from "@/lib/codec";
import type { Batch, Database, OutboxMessage, ProgressRow } from "@/lib/types";

export function karachiToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function daysRemaining(endDate: string, today = karachiToday()) {
  const start = Date.parse(`${today}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 86400000));
}

export function weekdayIndex(isoDate: string) {
  return new Date(`${isoDate}T12:00:00+05:00`).getUTCDay();
}

export function classDays(label: string) {
  const text = label.toLowerCase();
  if (text.includes("mon") && text.includes("thu")) return [1, 2, 3, 4];
  if (text.includes("fri") && text.includes("sun")) return [5, 6, 0];
  return [];
}

const seededScores: Record<string, Array<number | null>> = {
  "enr-ali": [88, 91, 84],
  "enr-hassan": [76, 81, null, null, null],
};

export function syncProgress(db: Database) {
  if (!db.progress) db.progress = [];
  if (!db.outbox) db.outbox = [];
  let changed = false;
  for (const enrollment of db.enrollments) {
    const course = courseBySlug(enrollment.courseSlug);
    if (!course) continue;
    course.moduleIds.forEach((moduleId, index) => {
      if (db.progress.some((row) => row.enrollmentId === enrollment.id && row.moduleId === moduleId)) return;
      const preset = seededScores[enrollment.id]?.[index] ?? null;
      const completed = preset !== null && preset !== undefined ? true : enrollment.id === "enr-ali";
      db.progress.push({
        id: `prog-${enrollment.id}-${moduleId}`,
        enrollmentId: enrollment.id,
        moduleId,
        completed,
        testScore: preset,
        completedAt: completed ? "2026-11-05T08:00:00.000Z" : null,
      });
      changed = true;
    });
  }
  return changed;
}

export function rowsFor(db: Database, enrollmentId: string) {
  return db.progress.filter((row) => row.enrollmentId === enrollmentId);
}

export function summarize(course: Course, rows: ProgressRow[], batch: Batch | null) {
  const ordered = course.moduleIds.map((id) => rows.find((row) => row.moduleId === id) ?? null);
  const done = ordered.filter((row) => row?.completed).length;
  const total = course.moduleIds.length;
  const scores = ordered.map((row) => row?.testScore).filter((score): score is number => typeof score === "number");
  return {
    done,
    total,
    percent: total ? Math.round((done / total) * 100) : 0,
    scores,
    average: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
    days: batch ? daysRemaining(batch.endDate) : null,
    modules: modulesFor(course).map((mod, index) => ({ module: mod, row: ordered[index] })),
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[char] ?? char);
}

export async function queueClassReminders(db: Database, now = new Date()) {
  const today = karachiToday(now);
  const weekday = weekdayIndex(today);
  let queued = 0;
  for (const batch of db.batches) {
    if (!classDays(batch.days).includes(weekday)) continue;
    if (today < batch.startDate || today > batch.endDate) continue;
    const course = courseBySlug(batch.courseSlug);
    const enrollments = db.enrollments.filter((item) => item.batchId === batch.id && (item.status === "active" || item.status === "invited"));
    for (const enrollment of enrollments) {
      const user = db.users.find((item) => item.id === enrollment.userId);
      if (!user?.email) continue;
      const key = `${batch.id}:${today}:${user.email.toLowerCase()}`;
      if (db.outbox.some((message) => message.key === key)) continue;
      const subject = `Class reminder · ${batch.name} · ${today}`;
      const html = `<p>EFI&gt; class reminder</p><p>${escapeHtml(user.fullName)}, your <strong>${escapeHtml(course?.name ?? "EFI")}</strong> batch meets today.</p><p>${escapeHtml(batch.days)} · ${escapeHtml(batch.time)}<br>${escapeHtml(institute.address)}</p>`;
      const message: OutboxMessage = {
        id: randomId(9),
        to: user.email,
        subject,
        html,
        createdAt: now.toISOString(),
        status: "demo",
        key,
      };
      const keySet = process.env.RESEND_API_KEY;
      if (keySet) {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${keySet}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "EFI Institute <onboarding@resend.dev>",
            to: user.email,
            subject,
            html,
          }),
        });
        message.status = response.ok ? "sent" : "failed";
      }
      db.outbox.push(message);
      queued += 1;
    }
  }
  db.outbox = db.outbox.slice(-200);
  return { queued, date: today };
}
