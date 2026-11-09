import Link from "next/link";
import { modules } from "@/lib/catalog";

const cards = [
  {
    slug: "3-month-certification",
    photo: "/harness/efi-thumb-1.jpg",
    when: "Weekdays · 3 months",
    name: "3-month certification",
    time: "Mon-Thu · 2:00-4:00PM or 4:00-6:00PM",
    points: ["Electrical fundamentals and safety", "Battery, starting, and charging", "Wiring and relays"],
    fee: "PKR 25,000",
  },
  {
    slug: "6-month-certification",
    photo: "/harness/efi-thumb-3.jpg",
    when: "Weekdays · 6 months",
    name: "6-month certification",
    time: "Mon-Thu · full syllabus",
    points: ["Sensors, actuators, and EFI systems", "Computerized diagnostics", "OBD-II scanners"],
    fee: "PKR 50,000",
  },
  {
    slug: "pro-technical",
    photo: "/harness/efi-thumb-4.jpg",
    when: "Weekend evening · 6 months",
    name: "Pro and technical",
    time: "Fri-Sun · 6:00-9:00PM",
    points: ["CAN bus and module programming", "ECU and body control work", "Key-fob programming"],
    fee: "PKR 50,000",
  },
  {
    slug: "3-month-weekend",
    photo: "/harness/efi-thumb-2.jpg",
    when: "Weekend · 3 months",
    name: "3-month weekend",
    time: "Fri-Sun · 3:00-6:00PM",
    points: ["Core auto electrical", "For students who work on weekdays", "Same lab, shorter week"],
    fee: "PKR 25,000",
  },
];

const rows = [
  ["3-month certification", "Mon-Thu", "2:00-4:00PM or 4:00-6:00PM", "PKR 25,000"],
  ["6-month certification", "Mon-Thu", "Weekday track", "PKR 50,000"],
  ["3-month weekend", "Fri-Sun", "3:00-6:00PM", "PKR 25,000"],
  ["Pro and technical", "Fri-Sun", "6:00-9:00PM", "PKR 50,000"],
];

export default function HomePage() {
  return (
    <div className="ed">
      <section className="ed-hero">
        <img src="/harness/efi-hero-photo.jpg" alt="" width={1920} height={1280} />
        <div className="ed-hero__shade" />
        <div className="ed-wrap ed-hero__copy">
          <p className="ed-kicker">Lahore · Admissions open</p>
          <h1>Auto electrician certification, taught on the car.</h1>
          <p>A lab course in wiring, charging systems, sensors, EFI, scanners, and module programming. Weekday and weekend batches at 53B Aitchison Society.</p>
          <div className="ed-hero__actions">
            <a className="ed-btn" href="#ed-courses">View courses</a>
            <a className="ed-btn ed-btn--ghost" href="https://wa.me/923704381083" target="_blank" rel="noopener">WhatsApp the institute</a>
          </div>
        </div>
      </section>

      <div className="ed-wrap">
        <div className="ed-boxes">
          <article>
            <h2>Daily hands-on lab</h2>
            <p>Sessions are on vehicles and bench rigs. The outline is built around practical work, not a classroom-only syllabus.</p>
          </article>
          <article>
            <h2>ISO registered</h2>
            <p>Graduates receive an ISO-registered certificate. The institute presents it for Gulf and overseas auto-electrical work.</p>
          </article>
          <article>
            <h2>Scanners in the lab</h2>
            <p>OBD-II scanners, key-fob programmers, and car modulators are part of the diagnostics and programming modules.</p>
          </article>
        </div>
      </div>

      <section className="ed-courses" id="ed-courses">
        <div className="ed-wrap">
          <header className="ed-head ed-head--row">
            <div>
              <h2>Courses</h2>
              <p>Four batches. The fee is for the full course.</p>
            </div>
            <Link className="ed-textlink" href="/courses">All courses</Link>
          </header>
          <div className="ed-grid">
            {cards.map((card) => (
              <article className="ed-card" key={card.slug}>
                <img src={card.photo} alt="" width={800} height={533} />
                <div className="ed-card__body">
                  <p className="ed-card__when">{card.when}</p>
                  <h3>{card.name}</h3>
                  <p className="ed-card__time">{card.time}</p>
                  <ul>
                    {card.points.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                  <div className="ed-card__row">
                    <span>{card.fee}</span>
                    <Link href={`/courses/${card.slug}#enroll`}>Enroll</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ed-learn" id="ed-outline">
        <div className="ed-wrap">
          <header className="ed-head">
            <h2>What the course covers</h2>
            <p>Six modules from the institute outline. The 3-month batches cover the foundation. The 6-month batches continue through diagnostics and programming.</p>
          </header>
          <ol className="ed-modules">
            {modules.map((mod, index) => (
              <li key={mod.id}>
                <span>{index + 1}</span>
                <div>
                  <h3>{mod.title}</h3>
                  <p>{mod.summary}</p>
                </div>
              </li>
            ))}
          </ol>
          <figure className="ed-sheet">
            <figcaption>Course outline</figcaption>
            <img src="/assets/efi-banner.jpeg" alt="EFI comprehensive automotive course outline" width={2172} height={724} />
          </figure>
        </div>
      </section>

      <section className="ed-time" id="ed-schedule">
        <div className="ed-wrap">
          <header className="ed-head">
            <h2>Weekly timetable</h2>
            <p>Weekday classes run Monday to Thursday. Weekend batches run Friday to Sunday. The printed sheet is below the table.</p>
          </header>
          <div className="ed-tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Days</th>
                  <th>Time</th>
                  <th>Fee</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell) => <td key={cell}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figure className="ed-sheet">
            <figcaption>Timetable sheet</figcaption>
            <img src="/harness/efi-timetable.jpeg" alt="Weekly training timetable" width={1117} height={944} />
          </figure>
        </div>
      </section>

      <section className="ed-after">
        <div className="ed-wrap ed-after__grid">
          <img src="/harness/efi-hero-photo.jpg" alt="Workshop bay used for EFI training" width={1200} height={800} />
          <div>
            <header className="ed-head">
              <h2>Where the training is used</h2>
            </header>
            <ul className="ed-points">
              <li>
                <strong>Workshops and dealerships</strong>
                <span>Electrical fault finding, wiring, and charging-system work.</span>
              </li>
              <li>
                <strong>Diagnostics</strong>
                <span>Scanner work on sensors, EFI, and OBD-II faults.</span>
              </li>
              <li>
                <strong>Gulf and overseas</strong>
                <span>The institute issues the certificate for graduates seeking that work.</span>
              </li>
            </ul>
            <a className="ed-btn" href="tel:+923704381083">Call +92 370 438 1083</a>
          </div>
        </div>
      </section>

      <section className="ed-cert" id="ed-cert">
        <div className="ed-wrap">
          <header className="ed-head">
            <h2>Find a certificate</h2>
            <p>Each certificate is filed under its roll number. Search opens that file. There is no separate login.</p>
          </header>
          <ol className="ed-steps">
            <li><span>1</span> Read the roll number on the certificate.</li>
            <li><span>2</span> Search it here, for example EFI-1024.</li>
            <li><span>3</span> Open the result and download the PDF.</li>
          </ol>
          <form action="/certificate" method="get">
            <label htmlFor="ed-roll">Roll number</label>
            <div className="ed-cert__line">
              <input id="ed-roll" type="search" name="q" placeholder="EFI-1024" autoComplete="off" required />
              <button type="submit">Search</button>
            </div>
          </form>
          <p className="ed-note">No result? WhatsApp +92 370 438 1083 with your name and batch.</p>
        </div>
      </section>

      <section className="ed-apply" id="ed-apply">
        <div className="ed-wrap ed-apply__row">
          <div>
            <h2>Admissions are open</h2>
            <p>Ask for a weekday or weekend seat. Classes are at 53B Aitchison Society, Lahore.</p>
          </div>
          <div className="ed-apply__actions">
            <a className="ed-btn" href="https://wa.me/923704381083" target="_blank" rel="noopener">WhatsApp</a>
            <a className="ed-btn ed-btn--light" href="tel:+923704381083">Call</a>
          </div>
        </div>
      </section>
    </div>
  );
}
