import type { Metadata } from "next";
import { courses, institute, pkr } from "@/lib/catalog";

export const metadata: Metadata = { title: "Timetable" };

export default function TimetablePage() {
  return (
    <>
      <header className="page-hero">
        <div className="wrap">
          <p className="kicker">EFI&gt; weekly schedule</p>
          <h1>Timetable</h1>
          <p>Weekday classes run Monday to Thursday. Weekend batches run Friday to Sunday. Desk hours are {institute.hours}.</p>
        </div>
      </header>
      <section className="section">
        <div className="wrap">
          <div className="table-wrap">
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
                {courses.map((course) => (
                  <tr key={course.slug}>
                    <td>{course.name}</td>
                    <td>{course.days}</td>
                    <td>{course.time}</td>
                    <td>{pkr(course.feePkr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figure className="sheet">
            <figcaption>Timetable sheet</figcaption>
            <img src="/photos/timetable.jpg" alt="Weekly training timetable" />
          </figure>
        </div>
      </section>
    </>
  );
}
