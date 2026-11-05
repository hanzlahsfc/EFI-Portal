import type { Metadata } from "next";
import { createBatch } from "@/app/admin/actions";
import { courseBySlug, courses } from "@/lib/catalog";
import { readDb } from "@/lib/db";

export const metadata: Metadata = { title: "Batches" };

export default async function BatchesPage({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const query = await searchParams;
  const rows = await readDb((db) => db.batches.map((batch) => ({
    batch,
    taken: db.enrollments.filter((item) => item.batchId === batch.id && item.status !== "withdrawn").length,
  })));

  return (
    <div className="stack">
      <div>
        <p className="kicker">EFI&gt; schedule</p>
        <h1 style={{ fontSize: 48 }}>Batches</h1>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.notice ? <p className="ok-note">{query.notice}</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Batch</th><th>Course</th><th>When</th><th>Seats</th></tr>
          </thead>
          <tbody>
            {rows.map(({ batch, taken }) => (
              <tr key={batch.id}>
                <td>{batch.name}</td>
                <td>{courseBySlug(batch.courseSlug)?.name}</td>
                <td>{batch.days} · {batch.time}</td>
                <td className="mono">{taken}/{batch.seats}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="panel form-grid" action={createBatch}>
        <h2 className="span-2">New batch</h2>
        <label className="field"><span>Name</span><input name="name" required /></label>
        <label className="field">
          <span>Course</span>
          <select name="courseSlug" defaultValue={courses[0].slug}>
            {courses.map((course) => <option key={course.slug} value={course.slug}>{course.name}</option>)}
          </select>
        </label>
        <label className="field"><span>Days</span><input name="days" placeholder="Mon–Thu" required /></label>
        <label className="field"><span>Time</span><input name="time" placeholder="2:00–4:00 PM" required /></label>
        <label className="field"><span>Starts</span><input name="startDate" type="date" required /></label>
        <label className="field"><span>Ends</span><input name="endDate" type="date" required /></label>
        <label className="field"><span>Seats</span><input name="seats" type="number" min={1} defaultValue={16} required /></label>
        <div className="span-2"><button className="btn" type="submit">Add batch</button></div>
      </form>
    </div>
  );
}
