"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function ClientNavbar({
  isPaid,
}: {
  isPaid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 🔑 Explicit mode handling
  const mode = searchParams.get("mode"); // "preview" | null

  // Route type detection
  const isSiteRoute = pathname.startsWith("/site/");
  const isPreview = isSiteRoute && mode === "preview";
  const isAdmin = isSiteRoute && mode !== "preview";

  const siteId = isSiteRoute ? pathname.split("/")[2] : null;

  // Base path:
  // - preview/admin → /site/{siteId}
  // - public subdomain → ""
  const base = isSiteRoute && siteId ? `/site/${siteId}` : "";

  // 🔐 Payment bar ONLY in preview AND explicitly unpaid
  const showPaymentBanner = isPreview && isPaid === false;

  return (
    <>
      {/* 🔔 PAYMENT BANNER (PREVIEW ONLY) */}
      {showPaymentBanner && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
            <span>
              You’re viewing a preview site. Secure your domain to go live.
            </span>

            <Link
              href={`${base}/checkout`}
              className="bg-white text-indigo-600 px-4 py-1.5 rounded-md font-semibold hover:bg-gray-100 transition"
            >
              Buy now & secure domain
            </Link>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav
        className={`fixed left-0 right-0 z-50 bg-white/90 backdrop-blur border-b ${
          showPaymentBanner ? "top-10" : "top-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href={base || "/"}
            className="text-xl font-extrabold text-gray-900"
          >
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
              className="py-3 text-base font-medium"
            >
              Pricing
            </Link>

            <Link
              href={`${base}/about`}
              className="py-3 text-base font-medium"
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

            {/* Upsell only in PREVIEW */}
            {isPreview && isPaid === false && (
              <Link
                href={`${base}/checkout`}
                className="py-3 text-base font-semibold text-center border border-indigo-600 text-indigo-600 rounded-lg"
                onClick={() => setOpen(false)}
              >
                Buy now & go live
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
