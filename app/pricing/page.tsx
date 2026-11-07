"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

// The public product paths on simplebookme.com.
const products = [
  {
    name: "Booking Website",
    description:
      "A complete website where customers can explore your services and send booking requests.",
    price: "Free",
    priceNote: "Free booking website",
    highlights: ["Your own shareable website link", "Services, booking and business details", "Edit your website anytime"],
    href: "/setup",
    cta: "Create free website",
    featured: true,
  },
  {
    name: "Availability Page",
    description:
      "Show your weekly working hours in one simple link, with contact details and a booking link.",
    price: "$9.99",
    priceNote: "USD · one-time payment",
    highlights: ["Share your weekly availability", "Update available hours anytime", "14-day free trial"],
    href: "/availability",
    cta: "Create availability page",
    featured: false,
  },
  {
    name: "Pricing Page",
    description:
      "Publish your services and prices in a professional, shareable list with your own branding.",
    price: "$9.99",
    priceNote: "USD · one-time payment",
    highlights: ["Add services and prices", "Share one pricing link", "14-day free trial"],
    href: "/pricing_page",
    cta: "Create pricing page",
    featured: false,
  },
  {
    name: "Cleaning Quote Generator",
    description:
      "Let customers get an estimated cleaning price based on their property and requested service.",
    price: "$9.99",
    priceNote: "USD · one-time payment",
    highlights: ["Customizable quote estimates", "Share a quote link", "14-day free trial"],
    href: "/cleaning/quote-gen",
    cta: "Create quote generator",
    featured: false,
  },
] as const;

export default function PricingPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<
    CustomerConfig | LandingConfig | null
  >(null);

  const [mode, setMode] = useState<"sales" | "client">("sales");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const hostname = window.location.hostname;
        const result = await getCustomerConfigFromHost(hostname);

        if (!cancelled) {
          setCustomer(result.config);
          setMode(result.mode);
        }
      } catch (error) {
        console.error("Unable to load pricing page:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </main>
    );
  }

  /* =====================================================
     SIMPLEBOOKME PRODUCT PRICING (PUBLIC SALES PAGE)
     ===================================================== */

  if (mode === "sales") {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <section className="px-5 pb-10 pt-14 text-center sm:px-8 sm:pt-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-semibold text-indigo-700">
              Simple, one-time pricing
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              The right tools for your business.
              <span className="block text-indigo-700">Without monthly fees.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Build a free booking website, or choose a focused tool for your
              schedule, pricing, or cleaning quotes. Create your link in minutes.
            </p>
          </div>
        </section>

        <section aria-label="SimpleBookMe products and prices" className="px-5 pb-14 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.name}
                className={`flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-md sm:p-7 ${
                  product.featured
                    ? "border-indigo-200 bg-indigo-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex min-h-6 items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {product.featured ? "Complete website" : "Standalone tool"}
                  </span>
                  {product.featured && (
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-800">
                      Free
                    </span>
                  )}
                </div>

                <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
                  {product.name}
                </h2>
                <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">
                  {product.description}
                </p>

                <div className="mt-5 border-t border-slate-200/80 pt-5">
                  <p className="text-3xl font-bold tracking-tight text-slate-950">
                    {product.price}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {product.priceNote}
                  </p>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2.5">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600"
                      >
                        <path
                          d="m4 10 4 4 8-8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <Link
                    href={product.href}
                    className={`flex min-h-12 items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
                      product.featured
                        ? "bg-indigo-700 text-white hover:bg-indigo-800"
                        : "border border-slate-300 bg-white text-slate-900 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    {product.cta}
                    <span className="ml-2" aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-100 bg-slate-50 px-5 py-14 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              How payment works
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              The booking website is free. Each standalone tool — Availability
              Page, Pricing Page, and Cleaning Quote Generator — includes a
              14-day free trial. After your trial, activate that tool for a
              one-time payment of $9.99 USD to keep its page available.
              No recurring subscription for these tools.
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Create your page first. Share your public link and manage it
              anytime through your private edit link.
            </p>
          </div>
        </section>

        <footer className="border-t border-slate-100 px-5 py-7 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} SimpleBookMe</p>
            <nav aria-label="Footer" className="flex flex-wrap justify-center gap-5">
              <Link href="/" className="hover:text-slate-900">Home</Link>
              <Link href="/support" className="hover:text-slate-900">Support</Link>
              <Link href="/qr-code-generator" className="hover:text-slate-900">Free QR code tool</Link>
            </nav>
          </div>
        </footer>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Pricing page unavailable
          </h1>

          <p className="mt-3 text-gray-600">
            We could not load the requested pricing information.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Return home
          </Link>
        </div>
      </main>
    );
  }

  /* =====================================================
     CLIENT WEBSITE PRICING PAGE
     ===================================================== */

  const customerConfig = customer as CustomerConfig;
  const pricing = customerConfig.pricing;

function handleSelectService(serviceName: string) {
  // If this business uses an external booking system,
  // use their external booking link instead.
  if (
    customerConfig.booking?.is_external &&
    customerConfig.booking.bookingLink
  ) {
    window.location.href = customerConfig.booking.bookingLink;
    return;
  }

  router.push(
    `/booking?service=${encodeURIComponent(serviceName)}`
  );
}

  if (!pricing?.rows?.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6">
        <div className="max-w-lg rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path
                d="M6 7h12M6 12h12M6 17h7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Pricing
          </h1>

          <p className="mt-4 leading-7 text-gray-500">
            Pricing information will be available soon. Please contact the
            business directly for details.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-5 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-100">
            Services and pricing
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
            {pricing.title || "Pricing"}
          </h1>

          {pricing.subtitle && (
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
              {pricing.subtitle}
            </p>
          )}
        </div>

        {/* Mobile cards */}
        <div className="mt-12 space-y-4 md:hidden">
          {pricing.rows.map((row) => (
            <article
              key={row.id}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-5">
                <h2 className="text-lg font-bold text-gray-900">
                  {row.name}
                </h2>

                <span className="shrink-0 rounded-full bg-indigo-50 px-4 py-2 font-bold text-indigo-700">
                  {row.price}
                </span>
              </div>

              {row.includes && (
                <p className="mt-4 leading-7 text-gray-600">
                  {row.includes}
                </p>
              )}
			  
			  <button
  type="button"
  onClick={() => handleSelectService(row.name)}
  className="mt-5 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
>
  Select
</button>
            </article>
          ))}
        </div>

        {/* Desktop table */}
        <div className="mt-12 hidden overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl md:block">
          <table className="w-full">
            <thead className="bg-gray-950 text-left text-white">
              <tr>
                <th className="px-7 py-5 text-sm font-semibold">
                  Service
                </th>

                <th className="w-40 px-7 py-5 text-sm font-semibold">
                  Price
                </th>

                <th className="px-7 py-5 text-sm font-semibold">
                  Details
                </th>
				<th className="w-32 px-7 py-5 text-sm font-semibold text-center">
  Book
</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {pricing.rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition hover:bg-indigo-50/40"
                >
                  <td className="px-7 py-6 font-bold text-gray-900">
                    {row.name}
                  </td>

                  <td className="px-7 py-6">
                    <span className="inline-flex rounded-full bg-indigo-50 px-4 py-2 font-bold text-indigo-700">
                      {row.price}
                    </span>
                  </td>

                  <td className="px-7 py-6 leading-7 text-gray-600">
                    {row.includes || "Contact us for more information."}
                  </td>
				  <td className="px-7 py-6 text-center">
  <button
    type="button"
    onClick={() => handleSelectService(row.name)}
    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
  >
    Select
  </button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            Contact us for availability, custom requests, or additional service
            information.
          </p>
        </div>
      </div>
    </main>
  );
}