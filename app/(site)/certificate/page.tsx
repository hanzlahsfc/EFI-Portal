import type { Metadata } from "next";
import Link from "next/link";
import { CertificatePreview } from "@/components/certificate-preview";
import { institute } from "@/lib/catalog";
import { readDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Verify a Certificate",
  description:
    "Verify an EFI Future Intelligence Institute certificate by roll number. Enter a roll number like EFI-1024 to confirm a graduate's course, issue date, and serial.",
};

function issuedOn(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Karachi" }).format(new Date(value));
}

export default async function CertificatePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const roll = (q ?? "").trim();
  const found = roll
    ? await readDb((db) => {
        const needle = roll.toLowerCase();
        return {
          cert: db.certificates.find((item) => item.rollNumber.toLowerCase() === needle) ?? null,
          user: db.users.find((item) => item.rollNumber?.toLowerCase() === needle) ?? null,
        };
      })
    : null;

  return (
    <div className="ed">
      <section className="ed-cert">
        <div className="ed-wrap">
          <header className="ed-head">
            <h2>Find a certificate</h2>
            <p>Each certificate is filed under its roll number. Search opens that file. There is no separate login.</p>
          </header>
          <form action="/certificate" method="get">
            <label htmlFor="ed-roll">Roll number</label>
            <div className="ed-cert__line">
              <input id="ed-roll" type="search" name="q" defaultValue={roll} placeholder="EFI-1024" autoComplete="off" required />
              <button type="submit">Search</button>
            </div>
          </form>
          {found?.cert ? (
            <p className="ed-result">
              Filed for {found.cert.studentName}, {found.cert.courseName}. Serial {found.cert.serial}.{" "}
              <a href={`/api/certificates/${encodeURIComponent(found.cert.rollNumber)}`}>Download PDF</a>
            </p>
          ) : null}
          {roll && found && !found.cert && found.user ? <p className="ed-result">Roll no. {found.user.rollNumber} is on the roll. A certificate has not been issued yet.</p> : null}
          {roll && found && !found.cert && !found.user ? <p className="ed-result">No file for roll no. {roll}.</p> : null}
          <p className="ed-note">No result? WhatsApp {institute.phoneDisplay} with your name and batch. Sample on file: <Link href="/certificate?q=EFI-1024">EFI-1024</Link></p>
        </div>
      </section>
      {found?.cert ? (
        <section className="ed-learn">
          <div className="ed-wrap">
            <CertificatePreview cert={found.cert} issued={issuedOn(found.cert.issuedAt)} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
