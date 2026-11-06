import type { Metadata } from "next";
import Link from "next/link";
import { readDb } from "@/lib/db";

export const metadata: Metadata = { title: "Staff desk" };

export default async function AdminHome() {
  const counts = await readDb((db) => {
    const students = db.users.filter((user) => user.role === "student");
    return {
      students: students.length,
      invited: db.enrollments.filter((item) => item.status === "invited").length,
      active: db.enrollments.filter((item) => item.status === "active").length,
      batches: db.batches.length,
    };
  });

  return (
    <div className="stack">
      <div className="row-between">
        <div>
          <p className="kicker">staff</p>
          <h1 style={{ fontSize: 48 }}>Desk</h1>
        </div>
        <Link className="btn" href="/admin/students/new">Add student</Link>
      </div>
      <div className="metrics">
        <Link className="metric" href="/admin/students"><span>Students</span><strong>{counts.students}</strong></Link>
        <div className="metric"><span>Invited</span><strong>{counts.invited}</strong></div>
        <div className="metric"><span>Active</span><strong>{counts.active}</strong></div>
        <Link className="metric" href="/admin/batches"><span>Batches</span><strong>{counts.batches}</strong></Link>
      </div>
      <div className="panel">
        <h2>Onboarding</h2>
        <p className="help">Add a student, then give them the QR on their record. The code opens their account setup. A Shopify order can create the same record through <span className="mono">POST /api/shopify/enroll</span>.</p>
      </div>
    </div>
  );
}
