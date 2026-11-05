import { DeskNav } from "@/components/desk-nav";
import { requireUser } from "@/lib/auth";

const items = [
  { href: "/portal", label: "Desk" },
  { href: "/portal/syllabus", label: "Syllabus" },
  { href: "/portal/progress", label: "Progress" },
  { href: "/portal/certificate", label: "Certificate" },
  { href: "/portal/account", label: "Account" },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("student");
  return (
    <div className="desk">
      <DeskNav items={items} userLabel={user.rollNumber ?? user.fullName} />
      <div className="desk-main">{children}</div>
    </div>
  );
}
