import type { Metadata } from "next";
import Link from "next/link";
import { courses, modules, pkr, whatsappLink } from "@/lib/catalog";

export const metadata: Metadata = { title: "Courses" };

export default function CoursesPage() {
  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <p className="kicker">EFI&gt; syllabus</p>
          <h1>Courses</h1>
          <p>Six modules from the institute outline. The 3-month batches cover the foundation. The 6-month batches continue through diagnostics and programming.</p>
        </div>
      </header>
      <section className="section">
        <div className="wrap grid-4">
          {courses.map((course) => (
            <article className="card" key={course.slug}>
              <img src={course.photo} alt="" />
              <div className="card-body">
                <p className="when">{course.days} · {course.duration}</p>
                <h3>{course.name}</h3>
                <p className="time">{course.time}</p>
                <ul>
                  {course.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
                <div className="card-row">
                  <span className="price">{pkr(course.feePkr)}</span>
                  <Link href={`/courses/${course.slug}`}>Open</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="wrap">
          <ol className="modules">
            {modules.map((mod) => (
              <li key={mod.id}>
                <span>{mod.code}</span>
                <div>
                  <h3>{mod.title}</h3>
                  <p>{mod.summary}</p>
                </div>
              </li>
            ))}
          </ol>
          <figure className="sheet">
            <figcaption>Course outline</figcaption>
            <img src="/photos/outline.jpg" alt="EFI comprehensive automotive course outline" />
          </figure>
          <p className="fine" style={{ marginTop: 18 }}>
            Seat requests go to the institute on WhatsApp.{" "}
            <a href={whatsappLink("Assalam o alaikum, please share the next EFI batch dates.")}>Message +92 370 438 1083</a>
          </p>
        </div>
      </section>
    </>
  );
}
