"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Detect preview mode: /site/[siteId]/...
  const isPreview = pathname.startsWith("/site/");
  const siteId = isPreview ? pathname.split("/")[2] : null;

  // Base path:
  // - preview → /site/{siteId}
  // - subdomain → ""
  const base = isPreview && siteId ? `/site/${siteId}` : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b">

      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href={base || "/"} className="text-xl font-extrabold text-gray-900">
          Simple<span className="text-indigo-600">BookMe</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href={`${base}/booking`}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Book appointment
          </Link>

          <Link
            href={`${base}/pricing`}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Pricing
          </Link>

          <Link
            href={`${base}/about`}
            className="py-3 text-base font-medium"
            onClick={() => setOpen(false)}
          >
            About me
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="text-xl">☰</span>
        </button>
      </div>

      {/* Mobile dropdown */}
	{open && (
	  <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg px-4 py-4 flex flex-col gap-4">

          <Link
            href={`${base}/about`}
            className="py-3 text-base font-medium"
            onClick={() => setOpen(false)}
          >
            About me
          </Link>

          <Link
            href={`${base}/pricing`}
            className="py-3 text-base font-medium"
            onClick={() => setOpen(false)}
          >
            Pricing
          </Link>

          <Link
            href={`${base}/booking`}
            className="py-3 text-base font-medium text-center bg-indigo-600 text-white rounded-lg"
            onClick={() => setOpen(false)}
          >
            Book appointment
          </Link>
        </div>
      )}
    </nav>
  );
}
