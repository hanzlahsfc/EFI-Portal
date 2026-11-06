import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="ed-foot" id="ed-contact">
      <div className="ed-foot__grid">
        <div>
          <img src="/harness/efi-logo.png" alt="EFI Future Intelligence Institute" width={543} height={459} />
          <p>Automotive electrical and EFI training in Lahore. Classes are hands-on, in the lab, on modern scanners.</p>
        </div>
        <div>
          <h2>Courses</h2>
          <ul>
            <li><Link href="/courses/3-month-certification">3-month certification</Link></li>
            <li><Link href="/courses/6-month-certification">6-month certification</Link></li>
            <li><Link href="/courses/pro-technical">6-month pro and technical</Link></li>
            <li><Link href="/courses/3-month-weekend">3-month weekend</Link></li>
          </ul>
        </div>
        <div>
          <h2>Information</h2>
          <ul>
            <li><Link href="/#ed-schedule">Class timetable</Link></li>
            <li><Link href="/#ed-outline">Course outline</Link></li>
            <li><Link href="/#ed-cert">Certificate search</Link></li>
            <li><Link href="/login">Student portal</Link></li>
          </ul>
        </div>
        <div>
          <h2>Contact</h2>
          <p>53B, Aitchison Society<br />Lahore, Pakistan</p>
          <p><a href="tel:+923704381083">+92 370 438 1083</a></p>
          <p>Mon-Thu 2-6PM<br />Fri-Sun 3-9PM</p>
          <p><a href="https://www.efiinstitute.com">efiinstitute.com</a></p>
          <div className="ed-social">
            <a href="https://wa.me/923704381083" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
      </div>
      <div className="ed-foot__bar">
        <span>© {new Date().getFullYear()} EFI Future Intelligence Institute</span>
        <span>Developed by <a href="https://cemzlah.com" target="_blank" rel="noopener">Cemzlah</a></span>
      </div>
    </footer>
  );
}
