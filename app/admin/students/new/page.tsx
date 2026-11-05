import type { Metadata } from "next";
import Link from "next/link";
import { createStudent } from "@/app/admin/actions";
import { readDb } from "@/lib/db";

export const metadata: Metadata = { title: "Add student" };

export default async function NewStudentPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  const batches = await readDb((db) => db.batches);
  return (
    <div className="stack">
      <p className="kicker"><Link href="/admin/students">Students</Link> / new</p>
      <h1 style={{ fontSize: 48 }}>Add student</h1>
      {query.error ? <p className="error">{query.error}</p> : null}
      <form className="panel form-grid" action={createStudent}>
        <label className="field"><span>Full name</span><input name="fullName" required /></label>
        <label className="field"><span>Email</span><input name="email" type="email" required /></label>
        <label className="field"><span>Phone</span><input name="phone" required /></label>
        <label className="field"><span>CNIC</span><input name="cnic" placeholder="35202-1234567-1" /></label>
        <label className="field span-2">
          <span>Batch</span>
          <select name="batchId" required defaultValue="">
            <option value="" disabled>Choose a batch</option>
            {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name} · {batch.days} {batch.time}</option>)}
          </select>
        </label>
        <div className="span-2"><button className="btn" type="submit">Create QR record</button></div>
      </form>
    </div>
  );
}
