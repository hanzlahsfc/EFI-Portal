"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Catalog" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ account }: { account?: { href: string; label: string } | null }) {
  const path = usePathname();
  const accountLink = account ? (
    <Link className="ed-login" href={account.href}>{account.label}</Link>
  ) : (
    <Link className="ed-login" href="/login">Login</Link>
  );
  return (
    <div className="ed-header">
      <div className="ed-bar">
        <Link className="ed-logo" href="/" aria-label="EFI Future Intelligence Institute">
          <img src="/harness/efi-logo.png" alt="EFI Future Intelligence Institute" width={543} height={459} />
        </Link>
        <input className="ed-check" id="ed-nav-toggle" type="checkbox" />
        <label className="ed-burger" htmlFor="ed-nav-toggle">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <span>Menu</span>
        </label>
        <nav className="ed-nav" aria-label="Main">
          {links.map((link) => {
            const current = link.href === "/" ? path === "/" : path.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={current ? "is-active" : undefined} aria-current={current ? "page" : undefined}>
                {link.label}
              </Link>
            );
          })}
          {account ? <Link className="ed-nav__login" href={account.href}>{account.label}</Link> : <Link className="ed-nav__login" href="/login">Login</Link>}
        </nav>
        {accountLink}
        <Link className="ed-enroll" href="/courses">Enroll</Link>
      </div>
    </div>
  );
}
