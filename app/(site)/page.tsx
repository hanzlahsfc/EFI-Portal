import Link from "next/link";
import { courses, institute, pkr, whatsappLink } from "@/lib/catalog";

const rails = [
  ["ISO", "Registered"],
  ["Hands-on", "Lab"],
  ["Gulf", "Pathway"],
  ["OBD-II", "Scanners"],
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <img className="hero-photo" src="/photos/hero.jpg" alt="" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="kicker">EFI&gt; Lahore · Admissions open</p>
          <h1>Auto electrician certification, taught on the car.</h1>
          <p>
            A lab course in wiring, charging systems, sensors, EFI, scanners, and module programming.
            Weekday and weekend batches at {institute.address}.
          </p>
          <div className="hero-actions">
            <Link className="btn" href="/courses">View courses</Link>
            <a className="btn ghost" href={whatsappLink("Assalam o alaikum, I want to ask about EFI admissions.")}>
              WhatsApp the institute
            </a>
          </div>
        </div>
        <aside className="rail" aria-label="Institute facts">
          {rails.map(([title, detail]) => (
            <div key={title}>
              <i />
              <strong>{title}</strong>
              <span>{detail}</span>
            </div>
          ))}
        </aside>
      </section>

      <div className="wrap">
        <div className="boxes">
          <article className="box">
            <h2>Daily hands-on lab</h2>
            <p>Sessions are on vehicles and bench rigs. The outline is built around practical work, not a classroom-only syllabus.</p>
          </article>
          <article className="box">
            <h2>ISO registered</h2>
            <p>Graduates receive an ISO-registered certificate. The institute presents it for Gulf and overseas auto-electrical work.</p>
          </article>
          <article className="box">
            <h2>Scanners in the lab</h2>
            <p>OBD-II scanners, key-fob programmers, and car modulators are part of the diagnostics and programming modules.</p>
          </article>
        </div>
      </div>

      <section className="section" id="courses">
        <div className="wrap">
          <div className="head-row">
            <div>
              <p className="kicker">Batches</p>
              <h2>Courses</h2>
              <p className="lede">Four batches. The fee is for the full course.</p>
            </div>
            <Link className="btn dark" href="/courses">All courses</Link>
          </div>
          <div className="grid-4">
            {courses.map((course) => (
              <article className="card" key={course.slug}>
                <img src={course.photo} alt="" />
                <div className="card-body">
                  <p className="when">{course.days} · {course.duration}</p>
                  <h3>{course.name}</h3>
                  <p className="time">{course.time}</p>
                  <div className="card-row">
                    <span className="price">{pkr(course.feePkr)}</span>
                    <Link href={`/courses/${course.slug}`}>Details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap grid-2">
          <img src="/photos/hero.jpg" alt="Workshop bay used for EFI training" />
          <div>
            <p className="kicker">After the course</p>
            <h2>Where the training is used</h2>
            <ul className="points">
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
            <a className="btn dark" href={`tel:${institute.phoneTel}`}>Call {institute.phoneDisplay}</a>
          </div>
        </div>
      </section>

      <section className="section apply">
        <div className="wrap">
          <div>
            <h2>Admissions are open</h2>
            <p>Ask for a weekday or weekend seat. Classes are at {institute.address}.</p>
          </div>
          <div className="actions">
            <a className="btn" href={whatsappLink("Assalam o alaikum, I want a seat in an EFI batch.")}>WhatsApp</a>
            <a className="btn light" href={`tel:${institute.phoneTel}`}>Call</a>
          </div>
        </div>
      </section>
    </>
  );
}
