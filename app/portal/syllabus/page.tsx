import type { Metadata } from "next";
import { courseBySlug } from "@/lib/catalog";
import { requireUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { rowsFor, summarize } from "@/lib/progress";

export const metadata: Metadata = { title: "Syllabus" };

export default async function SyllabusPage() {
  const user = await requireUser("student");
  const blocks = await readDb((db) => db.enrollments.filter((item) => item.userId === user.id).map((enrollment) => {
    const course = courseBySlug(enrollment.courseSlug);
    const batch = db.batches.find((item) => item.id === enrollment.batchId) ?? null;
    return { enrollment, course, batch, summary: course ? summarize(course, rowsFor(db, enrollment.id), batch) : null };
  }));

  return (
    <div className="stack">
      <div>
        <p className="kicker">{user.rollNumber}</p>
        <h1 style={{ fontSize: 48 }}>Syllabus</h1>
      </div>
      {blocks.map(({ enrollment, course, summary }) => (
        <section className="panel" key={enrollment.id}>
          <h2>{course?.name ?? enrollment.courseSlug}</h2>
          <ol className="modules">
            {summary?.modules.map(({ module, row }) => (
              <li key={module.id}>
                <details>
                  <summary>
                    <span>{module.code}</span>
                    <div>
                      <h3>{module.title}</h3>
                      <p>{module.hours} lab hours · {row?.completed ? "Completed" : "Not yet"}{row?.testScore !== null && row?.testScore !== undefined ? ` · test ${row.testScore}` : ""}</p>
                    </div>
                  </summary>
                  <div className="module-detail">
                    <p>{module.summary}</p>
                    <ul>
                      {module.topics.map((topic) => <li key={topic}>{topic}</li>)}
                    </ul>
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
