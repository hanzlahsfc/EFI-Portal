import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { courseBySlug, courses, modulesFor, pkr, whatsappLink } from "@/lib/catalog";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = courseBySlug(slug);
  return { title: course?.name ?? "Course" };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) notFound();
  const outline = modulesFor(course);

  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <p className="kicker">EFI&gt; {course.duration}</p>
          <h1>{course.name}</h1>
          <p>{course.summary}</p>
        </div>
      </header>
      <section className="section">
        <div className="wrap grid-2">
          <img src={course.photo} alt="" />
          <div className="prose">
            <div className="stat-row">
              <div><span>Fee</span><strong>{pkr(course.feePkr)}</strong></div>
              <div><span>Days</span><strong>{course.days}</strong></div>
              <div><span>Time</span><strong>{course.time}</strong></div>
            </div>
            <ul className="points">
              {course.points.map((point) => (
                <li key={point}><strong>{point}</strong></li>
              ))}
            </ul>
            <div className="actions">
              <a className="btn" href={whatsappLink(`Assalam o alaikum, I want to enroll in ${course.name}.`)}>Enroll on WhatsApp</a>
              <Link className="btn dark" href="/timetable">Timetable</Link>
            </div>
          </div>
        </div>
        <div className="wrap">
          <h2 style={{ marginTop: 42 }}>Modules in this batch</h2>
          <ol className="modules">
            {outline.map((mod) => (
              <li key={mod.id}>
                <span>{mod.code}</span>
                <div>
                  <h3>{mod.title}</h3>
                  <p>{mod.summary} · {mod.hours} lab hours</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
