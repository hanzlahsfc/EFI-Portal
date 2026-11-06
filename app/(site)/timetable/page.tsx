import type { Metadata } from "next";
import { courses, pkr } from "@/lib/catalog";

export const metadata: Metadata = { title: "Timetable" };

export default function TimetablePage() {
  return (
    <div className="ed">
      <section className="ed-time">
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
          <figure className="ed-sheet">
            <figcaption>Timetable sheet</figcaption>
            <img src="/harness/efi-timetable.jpeg" alt="Weekly training timetable" />
          </figure>
        </div>
      </section>
    </div>
  );
}
