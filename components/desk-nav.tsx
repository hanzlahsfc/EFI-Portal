"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DeskNav({
  items,
  userLabel,
}: {
  items: { href: string; label: string }[];
  userLabel: string;
}) {
  const path = usePathname();
  return (
    <div className="desk-bar">
      <div className="wrap">
        <Link href="/" className="desk-brand">
          <img src="/brand/efi-logo.png" alt="" />
          <span>EFI&gt; DESK</span>
        </Link>
        <nav className="desk-links" aria-label="Desk">
          {items.map((item) => {
            const current = path === item.href;
            return (
              <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="desk-user">
          <span>{userLabel}</span>
          <form action="/api/auth/logout" method="post">
            <button className="linkish" type="submit">Sign out</button>
          </form>
        </div>
      </div>
    </div>
  );
}
