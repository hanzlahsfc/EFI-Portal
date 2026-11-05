import type { Metadata } from "next";
import { institute } from "@/lib/catalog";

export const metadata: Metadata = { title: "Certificate" };

export default async function CertificatePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const roll = (q ?? "").trim();

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
              {roll ? (
                <p>Lookup for roll no. <span className="prompt">{roll}</span> — certificate files connect with the student portal.</p>
              ) : (
                <p>Search a roll number to pull a certificate — e.g. <span className="prompt">EFI-1024</span></p>
              )}
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
