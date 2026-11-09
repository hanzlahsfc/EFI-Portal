import type { Metadata } from "next";
import Link from "next/link";
import { courses, modules, pkr, whatsappLink } from "@/lib/catalog";

export const metadata: Metadata = { title: "Courses" };

const photos: Record<string, string> = {
  "3-month-certification": "/harness/efi-thumb-1.jpg",
  "6-month-certification": "/harness/efi-thumb-3.jpg",
  "pro-technical": "/harness/efi-thumb-4.jpg",
  "3-month-weekend": "/harness/efi-thumb-2.jpg",
};

export default function CoursesPage() {
  return (
    <div className="ed">
      <section className="ed-courses">
        <div className="ed-wrap">
          <header className="ed-head">
            <h2>Courses</h2>
            <p>Six modules from the institute outline. The 3-month batches cover the foundation. The 6-month batches continue through diagnostics and programming.</p>
          </header>
          <div className="ed-grid">
            {courses.map((course) => (
              <article className="ed-card" key={course.slug}>
                <img src={photos[course.slug]} alt="" width={800} height={533} />
                <div className="ed-card__body">
                  <p className="ed-card__when">{course.days} · {course.duration}</p>
                  <h3>{course.name}</h3>
                  <p className="ed-card__time">{course.time}</p>
                  <ul>
                    {course.points.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                  <div className="ed-card__row">
                    <span>{pkr(course.feePkr)}</span>
                    <Link href={`/courses/${course.slug}#enroll`}>Enroll</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <ol className="ed-modules" style={{ marginTop: 28 }}>
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
            <img src="/assets/efi-banner.jpeg" alt="EFI comprehensive automotive course outline" />
          </figure>
          <p className="ed-note" style={{ color: "#555" }}>
            Seat requests go to the institute on WhatsApp.{" "}
            <a href={whatsappLink("Assalam o alaikum, please share the next EFI batch dates.")}>Message +92 370 438 1083</a>
          </p>
        </div>
      </section>
    </div>
  );
}
