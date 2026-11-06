import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateBatch } from "@/app/admin/actions";
import { courseBySlug, courses } from "@/lib/catalog";
import { classDays } from "@/lib/progress";
import { readDb } from "@/lib/db";

export const metadata: Metadata = { title: "Edit batch" };

export default async function EditBatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const view = await readDb((db) => {
    const batch = db.batches.find((item) => item.id === id);
    if (!batch) return null;
    const taken = db.enrollments.filter((item) => item.batchId === batch.id && item.status !== "withdrawn").length;
    return { batch, taken };
  });
  if (!view) notFound();
  const { batch, taken } = view;

  return (
    <div className="stack">
      <div>
        <p className="kicker"><Link href="/admin/batches">Batches</Link> / {batch.name}</p>
        <h1 style={{ fontSize: 48 }}>Edit batch</h1>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.notice ? <p className="ok-note">{query.notice}</p> : null}
      <form className="panel form-grid" action={updateBatch}>
        <input type="hidden" name="id" value={batch.id} />
        <label className="field"><span>Name</span><input name="name" defaultValue={batch.name} required /></label>
        <label className="field">
          <span>Course</span>
          <select name="courseSlug" defaultValue={batch.courseSlug}>
            {courses.map((course) => <option key={course.slug} value={course.slug}>{course.name}</option>)}
          </select>
        </label>
        <label className="field"><span>Days</span><input name="days" defaultValue={batch.days} required /></label>
        <label className="field"><span>Time</span><input name="time" defaultValue={batch.time} required /></label>
        <label className="field"><span>Starts</span><input name="startDate" type="date" defaultValue={batch.startDate} required /></label>
        <label className="field"><span>Ends</span><input name="endDate" type="date" defaultValue={batch.endDate} required /></label>
        <label className="field"><span>Seats</span><input name="seats" type="number" min={Math.max(1, taken)} defaultValue={batch.seats} required /></label>
        <p className="help span-2">{taken} seats are already taken. Course on file: {courseBySlug(batch.courseSlug)?.name}.</p>
        {classDays(batch.days).length === 0 ? <p className="help span-2">Reminders cannot read these days. Use Mon–Thu, Fri–Sun, or a list such as Mon, Wed, Fri.</p> : null}
        <div className="span-2"><button className="btn" type="submit">Save batch</button></div>
      </form>
    </div>
  );
}
