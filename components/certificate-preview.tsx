import { institute } from "@/lib/catalog";
import type { Certificate } from "@/lib/types";

export function CertificatePreview({ cert, issued }: { cert: Certificate; issued: string }) {
  return (
    <article className="certificate">
      <div className="certificate-frame">
        <img src="/brand/efi-logo.png" alt="" />
        <p className="certificate-institute">{institute.name}</p>
        <h2>Certificate of completion</h2>
        <p className="certificate-line">This certifies that</p>
        <p className="certificate-name">{cert.studentName}</p>
        <p className="certificate-line">has completed the lab course</p>
        <p className="certificate-course">{cert.courseName}</p>
        <p className="certificate-meta">{cert.rollNumber} · {issued} · Lahore</p>
        <p className="certificate-serial">{cert.serial}</p>
        <p className="certificate-address">{institute.address}</p>
      </div>
    </article>
  );
}
