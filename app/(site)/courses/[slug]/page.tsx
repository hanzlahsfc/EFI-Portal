import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requestSeat } from "@/app/(site)/courses/actions";
import { courseBySlug, courses, institute, modulesFor, pkr, whatsappLink } from "@/lib/catalog";

const photos: Record<string, string> = {
  "3-month-certification": "/harness/efi-thumb-1.jpg",
  "6-month-certification": "/harness/efi-thumb-3.jpg",
  "pro-technical": "/harness/efi-thumb-4.jpg",
  "3-month-weekend": "/harness/efi-thumb-2.jpg",
};

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = courseBySlug(slug);
  return { title: course?.name ?? "Course" };
}

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const course = courseBySlug(slug);
  if (!course) notFound();
  const outline = modulesFor(course);

  return (
    <div className="ed">
      <section className="ed-learn">
        <div className="ed-wrap">
          <header className="ed-head">
            <h2>{course.name}</h2>
            <p>{course.summary}</p>
          </header>
          <div className="ed-after__grid">
            <img src={photos[course.slug]} alt="" />
            <div>
              <div className="ed-card__row" style={{ borderTop: 0, paddingTop: 0 }}>
                <span>{pkr(course.feePkr)}</span>
                <span style={{ color: "#333", fontWeight: 500 }}>{course.days} · {course.time}</span>
              </div>
              <ul className="ed-points">
                {course.points.map((point) => (
                  <li key={point}><strong>{point}</strong></li>
                ))}
              </ul>
              <div className="ed-hero__actions">
                <a className="ed-btn" href="#enroll">Enroll</a>
                <a className="ed-btn" href={whatsappLink(`Assalam o alaikum, I want to enroll in ${course.name}.`)} style={{ background: "#1c1c1c" }}>WhatsApp</a>
              </div>
            </div>
          </div>
          <header className="ed-head" id="enroll" style={{ marginTop: 42 }}>
            <h2>Enroll in {course.name}</h2>
            <p>Leave your name and phone. The desk places you in the next open batch and sends a QR to finish the account. Fee {pkr(course.feePkr)}. Questions: {institute.phoneDisplay}.</p>
          </header>
          {query.error ? <p className="error">{query.error}</p> : null}
          {query.notice ? <p className="ok-note">{query.notice}</p> : null}
          <form className="panel form-grid" action={requestSeat} style={{ marginBottom: 36 }}>
            <input type="hidden" name="courseSlug" value={course.slug} />
            <label className="field"><span>Full name</span><input name="fullName" required /></label>
            <label className="field"><span>Email</span><input name="email" type="email" required /></label>
            <label className="field span-2"><span>Phone</span><input name="phone" required placeholder="03xx xxx xxxx" /></label>
            <div className="span-2"><button className="btn" type="submit">Request this seat</button></div>
          </form>
          <header className="ed-head">
            <h2>Modules in this batch</h2>
          </header>
          <ol className="ed-modules">
            {outline.map((mod, index) => (
              <li key={mod.id}>
                <span>{index + 1}</span>
                <div>
                  <h3>{mod.title}</h3>
                  <p>{mod.summary} · {mod.hours} lab hours</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
