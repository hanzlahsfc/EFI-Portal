import type { Metadata } from "next";
import { institute, whatsappLink } from "@/lib/catalog";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(institute.address)}`;
  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <p className="kicker">EFI&gt; admissions</p>
          <h1>Contact</h1>
          <p>Ask for a weekday or weekend seat. The lab is in Aitchison Society, Lahore.</p>
        </div>
      </header>
      <section className="section">
        <div className="wrap contact-grid">
          <div className="panel">
            <h2>Institute</h2>
            <p className="contact-line">{institute.address}</p>
            <p className="contact-line"><a href={`tel:${institute.phoneTel}`}>{institute.phoneDisplay}</a></p>
            <p className="contact-line">{institute.weekdayHours}</p>
            <p className="contact-line">{institute.weekendHours}</p>
            <p className="contact-line"><a href={institute.website}>efiinstitute.com</a></p>
            <div className="actions" style={{ marginTop: 16 }}>
              <a className="btn" href={whatsappLink("Assalam o alaikum, I have a question about EFI.")}>WhatsApp</a>
              <a className="btn dark" href={map}>Map</a>
            </div>
          </div>
          <div className="panel">
            <h2>What to send</h2>
            <ul className="points">
              <li><strong>Name and phone</strong><span>So the desk can reply on WhatsApp.</span></li>
              <li><strong>Weekday or weekend</strong><span>3-month, 6-month, or the pro evening batch.</span></li>
              <li><strong>Certificate check</strong><span>A roll number such as EFI-1024, if you already graduated.</span></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
