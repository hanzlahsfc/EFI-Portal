import type { Metadata } from "next";
import Link from "next/link";
import { courseBySlug } from "@/lib/catalog";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { batchMeets, rowsFor, summarize } from "@/lib/progress";

export const metadata: Metadata = { title: "Student desk" };

export default async function PortalHome() {
  const user = await requireUser("student");
  const view = await readDb((db) => ({
    batch: db.batches.find((item) => item.id === user.batchId) ?? null,
    enrollments: db.enrollments
      .filter((item) => item.userId === user.id)
      .map((enrollment) => {
        const course = courseBySlug(enrollment.courseSlug);
        const batch = db.batches.find((item) => item.id === enrollment.batchId) ?? null;
        return {
          enrollment,
          course,
          batch,
          summary: course ? summarize(course, rowsFor(db, enrollment.id), batch) : null,
        };
      }),
  }));

  return (
    <div className="stack">
      <div>
        <p className="kicker">{user.rollNumber}</p>
        <h1 style={{ fontSize: 48 }}>{user.fullName}</h1>
      </div>
      {view.enrollments.filter(({ enrollment, batch }) => batch && (enrollment.status === "active" || enrollment.status === "invited") && batchMeets(batch)).map(({ enrollment, batch }) => (
        <p className="ok-note" key={enrollment.id}>Class today · {batch?.days} · {batch?.time}</p>
      ))}
      <div className="metrics">
        <div className="metric"><span>Roll</span><strong style={{ fontSize: 28 }}>{user.rollNumber}</strong></div>
        <div className="metric"><span>Phone</span><strong style={{ fontSize: 22 }}>{user.phone}</strong></div>
        <div className="metric"><span>CNIC</span><strong style={{ fontSize: 22 }}>{user.cnic || "—"}</strong></div>
        <div className="metric"><span>Batch</span><strong style={{ fontSize: 22 }}>{view.batch?.name ?? "—"}</strong></div>
      </div>
      <div className="panel">
        <h2>Enrollment</h2>
        {view.enrollments.length === 0 ? <p className="help">No course is on this record yet.</p> : null}
        <div className="table-wrap">
          <table>
            <thead><tr><th>Course</th><th>Schedule</th><th>Status</th><th>Shopify order</th><th>Progress</th></tr></thead>
            <tbody>
              {view.enrollments.map(({ enrollment, course, batch, summary }) => (
                <tr key={enrollment.id}>
                  <td>{course?.name ?? enrollment.courseSlug}</td>
                  <td>{batch ? `${batch.days} · ${batch.time}` : "—"}</td>
                  <td><span className={enrollment.status === "active" ? "badge live" : "badge"}>{enrollment.status}</span></td>
                  <td className="mono">{enrollment.shopifyOrderId ?? "—"}</td>
                  <td className="mono">{summary ? `${summary.percent}% · ${summary.days ?? "—"}d` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="help"><Link href="/portal/progress">Open the full progress record</Link></p>
      </div>
    </div>
  );
}
