import Link from "next/link";
import { courses, institute } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap foot-grid">
        <div>
          <img className="foot-logo" src="/brand/efi-logo.png" alt="" />
          <p>Automotive electrical and EFI training in Lahore. Classes are hands-on, in the lab, on modern scanners.</p>
        </div>
        <div>
          <h2>Courses</h2>
          <ul>
            {courses.map((course) => (
              <li key={course.slug}>
                <Link href={`/courses/${course.slug}`}>{course.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Information</h2>
          <ul>
            <li><Link href="/timetable">Class timetable</Link></li>
            <li><Link href="/courses">Course outline</Link></li>
            <li><Link href="/certificate">Certificate search</Link></li>
            <li><Link href="/login">Student portal</Link></li>
          </ul>
        </div>
        <div>
          <h2>Contact</h2>
          <p>{institute.address}<br />Pakistan</p>
          <p><a href={`tel:${institute.phoneTel}`}>{institute.phoneDisplay}</a></p>
          <p>{institute.weekdayHours}<br />{institute.weekendHours}</p>
          <p><a href={institute.website}>efiinstitute.com</a></p>
          <p><a href={`https://wa.me/${institute.whatsapp}`}>WhatsApp</a></p>
        </div>
      </div>
      <div className="wrap foot-bar">
        <span>© {new Date().getFullYear()} EFI Future Intelligence Institute</span>
        <span>Developed by <a href="https://cemzlah.com">Cemzlah</a></span>
      </div>
    </footer>
  );
}
