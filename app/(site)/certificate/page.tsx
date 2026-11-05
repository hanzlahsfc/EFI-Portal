import type { Metadata } from "next";
import { institute } from "@/lib/catalog";
import { readDb } from "@/lib/db";

export const metadata: Metadata = { title: "Certificate" };

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
  const issued = found?.cert
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Karachi" }).format(new Date(found.cert.issuedAt))
    : "";

  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <p className="kicker">EFI&gt; cert-verify</p>
          <h1>Find a certificate</h1>
          <p>Each certificate is filed under its roll number. Search opens that file. There is no separate public login.</p>
        </div>
      </header>
      <section className="section">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div className="term">
            <div className="term-bar">
              <span className="dot r" /><span className="dot y" /><span className="dot g" />
              <span className="term-title">EFI / CERT-VERIFY</span>
            </div>
            <div className="term-screen">
              <div><span className="ok">READY</span> — roll-number lookup</div>
              {!roll ? <p>Search a roll number to pull a certificate — e.g. <span className="prompt">EFI-1024</span></p> : null}
              {roll && found?.cert ? (
                <p>
                  <span className="ok">FILED</span> — {found.cert.studentName}, {found.cert.courseName}. Issued {issued}. Serial {found.cert.serial}.{" "}
                  <a href={`/api/certificates/${encodeURIComponent(found.cert.rollNumber)}`}>Download PDF</a>
                </p>
              ) : null}
              {roll && found && !found.cert && found.user ? <p>Roll no. <span className="prompt">{found.user.rollNumber}</span> is on the roll. A certificate has not been issued yet.</p> : null}
              {roll && found && !found.cert && !found.user ? <p>No file for roll no. <span className="prompt">{roll}</span>.</p> : null}
              <form className="prompt-row" action="/certificate" method="get">
                <span className="prompt">EFI&gt;</span>
                <input name="q" defaultValue={roll} placeholder="EFI-1024" aria-label="Roll number" required />
                <button className="btn" type="submit">Scan</button>
              </form>
              <p className="fine">No result? WhatsApp {institute.phoneDisplay} with your name and batch.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
