import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export const metadata: Metadata = { title: "Certificate" };

export default async function PortalCertificatePage() {
  const user = await requireUser("student");
  const cert = await readDb((db) => db.certificates.find((item) => item.userId === user.id) ?? null);
  const issued = cert
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Karachi" }).format(new Date(cert.issuedAt))
    : "";

  return (
    <div className="stack">
      <div>
        <p className="kicker">EFI&gt; {user.rollNumber}</p>
        <h1 style={{ fontSize: 48 }}>Certificate</h1>
      </div>
      {cert ? (
        <div className="panel">
          <h2>{cert.courseName}</h2>
          <p className="help">Issued {issued} · {cert.serial}</p>
          <a className="btn" href={`/api/certificates/${encodeURIComponent(cert.rollNumber)}`}>Download PDF</a>
        </div>
      ) : (
        <div className="panel">
          <p className="help">Your certificate is not issued yet. The desk files it under {user.rollNumber} when the course is complete.</p>
        </div>
      )}
    </div>
  );
}
