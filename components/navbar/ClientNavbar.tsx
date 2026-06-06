"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";

export default function ClientNavbar({
  isPaid,
}: {
  isPaid?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔑 Explicit mode handling
  const mode = searchParams.get("mode");

  // Route type detection
  const isSiteRoute = pathname.startsWith("/site/");
  const isPreview = isSiteRoute && mode === "preview";

  const siteId = isSiteRoute ? pathname.split("/")[2] : null;

  // Base path:
  // - preview/admin → /site/{siteId}
  // - public subdomain → ""
  const base = isSiteRoute && siteId ? `/site/${siteId}` : "";

  // 🔐 Payment bar ONLY in preview AND explicitly unpaid
  const showPaymentBanner = false;

  // Booking logic
  const [customerKey, setCustomerKey] = useState<string | null>(null);
  const [bookingLink, setBookingLink] = useState<string | null>(null);
  const [isExternalBooking, setIsExternalBooking] = useState(false);
  
  const [clientLogoUrl, setClientLogoUrl] = useState<string | null>(null);
const [clientBusinessName, setClientBusinessName] = useState("");

  useEffect(() => {
    async function load() {
      const hostname = window.location.hostname;

      const result = await getCustomerConfigFromHost(hostname);

      setCustomerKey(result.key);

		if (result.mode === "client") {
		  const customer = result.config as CustomerConfig;

		  setIsExternalBooking(!!customer.booking?.is_external);
		  setBookingLink(customer.booking?.bookingLink || null);

		  setClientLogoUrl(customer.branding?.logoUrl || null);
		  setClientBusinessName(customer.businessName || "");
		}
    }

    load();
  }, []);

  function handleBookAppointment() {
    if (isExternalBooking && bookingLink) {
      window.location.href = bookingLink;
      return;
    }

	if (base) {
	  router.push(`${base}/booking`);
	  return;
	}

	router.push("/booking");
  }

  return (
    <>
      {/* 🔔 PAYMENT BANNER */}
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
        className={`fixed left-0 right-0 z-[9999] bg-white/90 backdrop-blur border-b ${
          showPaymentBanner ? "top-10" : "top-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
		{/* Logo / Brand */}
		<div className="flex items-center min-w-0">
		  {clientLogoUrl ? (
			<Link href={base || "/"} className="flex items-center min-w-0">
			  <img
				src={clientLogoUrl}
				alt={
				  clientBusinessName
					? `${clientBusinessName} logo`
					: "Business logo"
				}
				className="h-9 sm:h-10 w-auto max-w-[150px] sm:max-w-[220px] object-contain"
			  />
			</Link>
		  ) : clientBusinessName ? (
			<Link
			  href={base || "/"}
			  className="text-lg sm:text-xl font-extrabold text-gray-900 truncate max-w-[180px] sm:max-w-[260px]"
			>
			  {clientBusinessName}
			</Link>
		  ) : (
			<Link
			  href={base || "/"}
			  className="text-xl font-extrabold text-gray-900 shrink-0"
			>
			  Simple<span className="text-indigo-600">BookMe</span>
			</Link>
		  )}

		  {isPreview && (
			<span className="hidden sm:inline-flex ml-3 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 border border-indigo-100">
			  Preview by SimpleBookMe
			</span>
		  )}
		</div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={handleBookAppointment}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Book appointment
            </button>

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
              About
            </Link>
			
			<Link
		  href={`${base}/gallery`}
		  className="py-3 text-base font-medium"
		>
		  Portfolio
		</Link>
		
		<Link
		  href={`${base}/schedule`}
		  className="py-3 text-base font-medium"
		>
		  Schedule
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
              About
            </Link>
			
			<Link
			  href={`${base}/gallery`}
			  className="py-3 text-base font-medium"
			  onClick={() => setOpen(false)}
			>
			  Portfolio
			</Link>
			
			<Link
		  href={`${base}/schedule`}
		  className="py-3 text-base font-medium"
		  onClick={() => setOpen(false)}
		>
		  Schedule
		</Link>

            <Link
              href={`${base}/pricing`}
              className="py-3 text-base font-medium"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>

            <button
              onClick={() => {
                setOpen(false);
                handleBookAppointment();
              }}
              className="py-3 text-base font-medium text-center bg-indigo-600 text-white rounded-lg"
            >
              Book appointment
            </button>

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