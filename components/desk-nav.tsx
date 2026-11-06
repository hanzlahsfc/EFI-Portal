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
    <div className="ed-header">
      <div className="ed-bar">
        <Link className="ed-logo" href="/" aria-label="EFI Future Intelligence Institute">
          <img src="/harness/efi-logo.png" alt="EFI Future Intelligence Institute" width={543} height={459} />
        </Link>
        <input className="ed-check" id="desk-nav-toggle" type="checkbox" />
        <label className="ed-burger" htmlFor="desk-nav-toggle">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <span>Menu</span>
        </label>
        <nav className="ed-nav" aria-label="Desk">
          {items.map((item) => {
            const current = item.href === "/portal" || item.href === "/admin" ? path === item.href : path.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={current ? "is-active" : undefined} aria-current={current ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <span className="ed-login">{userLabel}</span>
        <form action="/api/auth/logout" method="post">
          <button className="ed-enroll" type="submit">Sign out</button>
        </form>
      </div>
    </div>
  );
}
