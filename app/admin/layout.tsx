import { DeskNav } from "@/components/desk-nav";
import { requireUser } from "@/lib/auth";

const items = [
  { href: "/admin", label: "Desk" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/batches", label: "Batches" },
  { href: "/admin/account", label: "Account" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("staff");
  return (
    <div className="desk">
      <DeskNav items={items} userLabel={user.fullName} />
      <div className="desk-main">{children}</div>
    </div>
  );
}
