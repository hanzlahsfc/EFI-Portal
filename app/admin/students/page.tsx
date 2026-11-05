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
          <p className="kicker">EFI&gt; roll</p>
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
            {rows.map(({ user, enrollment, course }) => (
              <tr key={user.id}>
                <td className="mono">{user.rollNumber}</td>
                <td><Link href={`/admin/students/${user.id}`}>{user.fullName}</Link></td>
                <td>{course?.name ?? "—"}</td>
                <td><span className={enrollment?.status === "active" ? "badge live" : "badge"}>{enrollment?.status ?? "—"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
