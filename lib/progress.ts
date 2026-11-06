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

const dayIndex: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

export function classDays(label: string) {
  const text = label.toLowerCase();
  const pattern = /\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tues|tue|wed|thurs|thur|thu|fri|sat)\b/g;
  const matches = [...text.matchAll(pattern)];
  if (matches.length === 0) return [];
  if (matches.length === 2) {
    const between = text.slice((matches[0].index ?? 0) + matches[0][0].length, matches[1].index);
    if (/\bto\b|[–—-]/.test(between)) {
      const days: number[] = [];
      let day = dayIndex[matches[0][1]];
      const end = dayIndex[matches[1][1]];
      for (let step = 0; step < 7; step += 1) {
        days.push(day);
        if (day === end) break;
        day = (day + 1) % 7;
      }
      return days;
    }
  }
  return [...new Set(matches.map((match) => dayIndex[match[1]]))];
}

export function batchMeets(batch: Batch, today = karachiToday()) {
  if (!batch.startDate || !batch.endDate) return false;
  if (today < batch.startDate || today > batch.endDate) return false;
  return classDays(batch.days).includes(weekdayIndex(today));
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

export function reminderKey(batchId: string, today: string, email: string) {
  return `${batchId}:${today}:${email.toLowerCase()}`;
}

export function reminderRecipients(db: Database, batch: Batch) {
  return db.enrollments
    .filter((item) => item.batchId === batch.id && (item.status === "active" || item.status === "invited"))
    .map((enrollment) => db.users.find((item) => item.id === enrollment.userId))
    .filter((user): user is NonNullable<typeof user> => Boolean(user?.email));
}

export async function queueClassReminders(db: Database, now = new Date()) {
  const today = karachiToday(now);
  let queued = 0;
  for (const batch of db.batches) {
    if (!batchMeets(batch, today)) continue;
    const course = courseBySlug(batch.courseSlug);
    for (const user of reminderRecipients(db, batch)) {
      const key = reminderKey(batch.id, today, user.email);
      if (db.outbox.some((message) => message.key === key)) continue;
      const subject = `Class today · ${batch.name}`;
      const html = `<p>${escapeHtml(user.fullName)}, your ${escapeHtml(course?.name ?? "EFI")} class is today.</p><p>${escapeHtml(batch.name)}<br>${escapeHtml(batch.days)} · ${escapeHtml(batch.time)}<br>${escapeHtml(institute.address)}</p>`;
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
