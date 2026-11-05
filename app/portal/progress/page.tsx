import type { Metadata } from "next";
import { courseBySlug } from "@/lib/catalog";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { rowsFor, summarize } from "@/lib/progress";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const user = await requireUser("student");
  const blocks = await readDb((db) => db.enrollments.filter((item) => item.userId === user.id).map((enrollment) => {
    const course = courseBySlug(enrollment.courseSlug);
    const batch = db.batches.find((item) => item.id === enrollment.batchId) ?? null;
    return { enrollment, course, batch, summary: course ? summarize(course, rowsFor(db, enrollment.id), batch) : null };
  }));

  return (
    <div className="stack">
      <div>
        <p className="kicker">EFI&gt; {user.rollNumber}</p>
        <h1 style={{ fontSize: 48 }}>Progress</h1>
      </div>
      {blocks.map(({ enrollment, course, summary }) => summary ? (
        <section className="panel stack" key={enrollment.id}>
          <div className="row-between">
            <h2>{course?.name}</h2>
            <strong className="mono">{summary.percent}%</strong>
          </div>
          <div className="progress-track" aria-hidden="true"><span style={{ width: `${summary.percent}%` }} /></div>
          <div className="metrics">
            <div className="metric"><span>Modules</span><strong>{summary.done}/{summary.total}</strong></div>
            <div className="metric"><span>Days left</span><strong>{summary.days ?? "—"}</strong></div>
            <div className="metric"><span>Test average</span><strong>{summary.average ?? "—"}</strong></div>
            <div className="metric"><span>Status</span><strong style={{ fontSize: 22 }}>{enrollment.status}</strong></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Module</th><th>State</th><th>Test</th></tr></thead>
              <tbody>
                {summary.modules.map(({ module, row }) => (
                  <tr key={module.id}>
                    <td>{module.title}</td>
                    <td>{row?.completed ? "Completed" : "Open"}</td>
                    <td className="mono">{row?.testScore ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null)}
    </div>
  );
}
