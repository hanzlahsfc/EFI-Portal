import type { Metadata } from "next";
import Link from "next/link";
import { courseBySlug } from "@/lib/catalog";
import { readDb } from "@/lib/db";

export const metadata: Metadata = { title: "Students" };

export default async function StudentsPage() {
  const rows = await readDb((db) => db.users
    .filter((user) => user.role === "student")
    .map((user) => {
      const enrollment = db.enrollments.find((item) => item.userId === user.id);
      const batch = db.batches.find((item) => item.id === user.batchId);
      return { user, enrollment, batch, course: courseBySlug(enrollment?.courseSlug ?? "") };
    }));

  return (
    <div className="stack">
      <div className="row-between">
        <div>
          <p className="kicker">roll</p>
          <h1 style={{ fontSize: 48 }}>Students</h1>
        </div>
        <Link className="btn" href="/admin/students/new">Add student</Link>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Roll</th>
              <th>Name</th>
              <th>Course</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ user, enrollment, course }) => {
              const href = `/admin/students/${user.id}`;
              return (
                <tr className="click-row" key={user.id}>
                  <td className="mono"><Link href={href}>{user.rollNumber}</Link></td>
                  <td><Link href={href}>{user.fullName}</Link></td>
                  <td><Link href={href}>{course?.name ?? "—"}</Link></td>
                  <td><Link href={href}><span className={enrollment?.status === "active" ? "badge live" : "badge"}>{enrollment?.status ?? "—"}</span></Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
