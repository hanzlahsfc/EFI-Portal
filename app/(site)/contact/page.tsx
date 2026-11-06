import type { Metadata } from "next";
import { institute, whatsappLink } from "@/lib/catalog";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(institute.address)}`;
  return (
    <div className="ed">
      <section className="ed-learn">
        <div className="ed-wrap">
          <header className="ed-head">
            <h2>Contact</h2>
            <p>Ask for a weekday or weekend seat. The lab is in Aitchison Society, Lahore.</p>
          </header>
          <div className="ed-grid">
            <article className="ed-card" style={{ display: "block" }}>
              <div className="ed-card__body">
                <h3>Institute</h3>
                <p className="ed-card__time">{institute.address}</p>
                <p className="ed-card__time"><a href={`tel:${institute.phoneTel}`}>{institute.phoneDisplay}</a></p>
                <p className="ed-card__time">{institute.weekdayHours}</p>
                <p className="ed-card__time">{institute.weekendHours}</p>
                <p className="ed-card__time"><a href={institute.website}>efiinstitute.com</a></p>
                <div className="ed-hero__actions">
                  <a className="ed-btn" href={whatsappLink("Assalam o alaikum, I have a question about EFI.")}>WhatsApp</a>
                  <a className="ed-btn" href={map} style={{ background: "#1c1c1c" }}>Map</a>
                </div>
              </div>
            </article>
            <article className="ed-card" style={{ display: "block" }}>
              <div className="ed-card__body">
                <h3>What to send</h3>
                <ul className="ed-points">
                  <li><strong>Name and phone</strong><span>So the desk can reply on WhatsApp.</span></li>
                  <li><strong>Weekday or weekend</strong><span>3-month, 6-month, or the pro evening batch.</span></li>
                  <li><strong>Certificate check</strong><span>A roll number such as EFI-1024, if you already graduated.</span></li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
