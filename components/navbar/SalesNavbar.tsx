"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function SalesNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /* --------------------------------------------------
   * 🔒 HARD GUARD
   * Never render SalesNavbar on client / preview routes
   * -------------------------------------------------- */
  const isPreviewRoute = pathname.startsWith("/site/");
  const isSubdomain =
    typeof window !== "undefined" &&
    window.location.hostname.split(".").length > 2;

  if (isPreviewRoute || isSubdomain) {
    return null;
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-extrabold text-gray-900"
        >
          Simple<span className="text-indigo-600">BookMe</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => router.push("/pricing")}
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Pricing
          </button>

          <button
            onClick={() => router.push("/about")}
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            About
          </button>
		  
		<button
            onClick={() => router.push("/guide")}
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Business Guide
          </button>

          <button
            onClick={() => router.push("/setup")}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Get started
          </button>
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
        <div className="md:hidden border-t bg-white px-4 py-4 flex flex-col gap-4">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/pricing");
            }}
            className="py-3 text-base font-medium text-left"
          >
            Pricing
          </button>

          <button
            onClick={() => {
              setOpen(false);
              router.push("/about");
            }}
            className="py-3 text-base font-medium text-left"
          >
            About
          </button>
		  
		<button
            onClick={() => {
              setOpen(false);
              router.push("/guide");
            }}
            className="py-3 text-base font-medium text-left"
          >
            Business Guide
          </button>

          <button
            onClick={() => {
              setOpen(false);
              router.push("/setup");
            }}
            className="py-3 text-base font-medium text-center bg-indigo-600 text-white rounded-lg"
          >
            Get started
          </button>
        </div>
      )}
    </nav>
  );
}
