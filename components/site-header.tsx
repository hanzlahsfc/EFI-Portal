"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { institute } from "@/lib/catalog";

const links = [
  ["/", "Home"],
  ["/courses", "Courses"],
  ["/timetable", "Timetable"],
  ["/certificate", "Certificate"],
  ["/contact", "Contact"],
];

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span>EFI / Lahore</span>
          <span>{institute.hours}</span>
          <a href={`tel:${institute.phoneTel}`}>{institute.phoneDisplay}</a>
        </div>
      </div>
      <div className="brandband">
        <Link href="/" className="logo-pad" aria-label={institute.name}>
          <img src="/brand/efi-logo.png" alt={institute.name} />
        </Link>
      </div>
      <nav className={open ? "nav open" : "nav"} aria-label="Primary">
        <div className="wrap">
          <button className="nav-burger" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            {open ? "Close" : "Menu"}
          </button>
          <div className="nav-links">
            {links.map(([href, label]) => {
              const current = href === "/" ? path === "/" : path.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={current ? "page" : undefined}>
                  {label}
                </Link>
              );
            })}
          </div>
          <Link className="nav-portal" href="/login">
            Student portal
          </Link>
        </div>
      </nav>
    </>
  );
}
