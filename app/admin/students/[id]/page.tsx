import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { issueCertificate, updateStudent } from "@/app/admin/actions";
import { courseBySlug } from "@/lib/catalog";
import { readDb } from "@/lib/db";
import { siteOrigin } from "@/lib/session";

export const metadata: Metadata = { title: "Student" };

export default async function StudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const data = await readDb((db) => {
    const user = db.users.find((item) => item.id === id && item.role === "student");
    if (!user) return null;
    return {
      user,
      enrollment: db.enrollments.find((item) => item.userId === user.id) ?? null,
      batches: db.batches,
      certificate: db.certificates.find((item) => item.userId === user.id) ?? null,
    };
  });
  if (!data) notFound();
  const { user, enrollment, batches, certificate } = data;
  const course = courseBySlug(enrollment?.courseSlug ?? "");
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : siteOrigin();
  const onboardUrl = user.qrToken ? `${origin}/onboard/${user.qrToken}` : "";

  return (
    <div className="stack">
      <p className="kicker"><Link href="/admin/students">Students</Link> / {user.rollNumber}</p>
      <div className="row-between">
        <h1 style={{ fontSize: 48 }}>{user.fullName}</h1>
        <span className={enrollment?.status === "active" ? "badge live" : "badge"}>{enrollment?.status}</span>
      </div>
      {query.error ? <p className="error">{query.error}</p> : null}
      {query.notice ? <p className="ok-note">{query.notice}</p> : null}
      <div className="panel qr-card">
        {user.qrToken ? <img src={`/api/qr/${encodeURIComponent(user.qrToken)}`} alt={`Onboarding QR for ${user.fullName}`} /> : <div />}
        <div>
          <p className="kicker">Personal QR</p>
          <h2>{user.rollNumber}</h2>
          <p className="help">{course?.name} · {user.onboarded ? "Password is set." : "Waiting for the student to open the QR."}</p>
          <p className="mono" style={{ wordBreak: "break-all" }}>{onboardUrl}</p>
          {certificate ? (
            <p><a href={`/api/certificates/${encodeURIComponent(certificate.rollNumber)}`}>Download {certificate.serial}</a></p>
          ) : (
            <form action={issueCertificate}>
              <input type="hidden" name="id" value={user.id} />
              <button className="btn" type="submit">Issue certificate</button>
            </form>
          )}
        </div>
      </div>
      <form className="panel form-grid" action={updateStudent}>
        <input type="hidden" name="id" value={user.id} />
        <label className="field"><span>Full name</span><input name="fullName" defaultValue={user.fullName} required /></label>
        <label className="field"><span>Email</span><input name="email" type="email" defaultValue={user.email} required /></label>
        <label className="field"><span>Phone</span><input name="phone" defaultValue={user.phone} required /></label>
        <label className="field"><span>CNIC</span><input name="cnic" defaultValue={user.cnic} /></label>
        <label className="field">
          <span>Batch</span>
          <select name="batchId" defaultValue={user.batchId ?? ""}>
            {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue={enrollment?.status ?? "invited"}>
            <option value="invited">Invited</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </label>
        <div className="span-2"><button className="btn" type="submit">Save record</button></div>
      </form>
    </div>
  );
}
