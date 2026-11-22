"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/*
 * Real <a href> links (not router.push buttons), so search engines
 * can follow the menu. Navbar.tsx already hides this on customer
 * subdomains; the path guard below covers /site/{id} previews.
 */
const MENU = [
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
  { href: "/guide", label: "Business Guide" },
  { href: "/tools", label: "Tools" },
];

export default function SalesNavbar() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  /* --------------------------------------------------
   * 🔒 HARD GUARD
   * Never render SalesNavbar on client / preview routes
   * -------------------------------------------------- */
  if (pathname.startsWith("/site/")) {
    return null;
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold text-gray-900">
          Simple<span className="text-indigo-600">BookMe</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-black"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/setup"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Get started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="text-xl">☰</span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t bg-white px-4 py-4 flex flex-col gap-4">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium text-left"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/setup"
            onClick={() => setOpen(false)}
            className="py-3 text-base font-medium text-center bg-indigo-600 text-white rounded-lg"
          >
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}
