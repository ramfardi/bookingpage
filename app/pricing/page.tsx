"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

/* =====================================================
   STATIC SALES CONTENT
   ===================================================== */

const salesFeatures = [
  {
    title: "Your own website link",
    description:
      "Get a unique SimpleBookMe subdomain that you can share with customers.",
  },
  {
    title: "Built-in booking",
    description:
      "Receive booking requests directly by email without needing another platform.",
  },
  {
    title: "External booking support",
    description:
      "Already use Calendly, Fresha, Vagaro, or another service? Connect your existing booking link.",
  },
  {
    title: "Services and pricing",
    description:
      "Display your services, prices, packages, and what each service includes.",
  },
  {
    title: "Weekly availability",
    description:
      "Show customers the days and time blocks when you are available.",
  },
  {
    title: "Portfolio gallery",
    description:
      "Upload photos and videos to showcase completed work, your location, or your services.",
  },
  {
    title: "Before-and-after displays",
    description:
      "Present transformations and results with engaging before-and-after content.",
  },
  {
    title: "Custom branding",
    description:
      "Add your business logo, service area, business name, and personalized homepage content.",
  },
  {
    title: "Testimonials",
    description:
      "Display customer reviews and connect visitors to your Google review page.",
  },
  {
    title: "Contact and social links",
    description:
      "Add your email, phone number, address, Instagram, TikTok, LinkedIn, and other profiles.",
  },
  {
    title: "Local SEO setup",
    description:
      "Your business name, services, city, and website content are used to create search-friendly metadata.",
  },
  {
    title: "Edit anytime",
    description:
      "Use your private edit link to update your website whenever your business changes.",
  },
];

const businessTypes = [
  "Hair salons",
  "Barbers",
  "Cleaning companies",
  "Car detailers",
  "Pet groomers",
  "Nail salons",
  "Photographers",
  "Accountants",
  "Personal trainers",
  "Home service providers",
  "Freelancers",
  "Coaches and consultants",
];

const faqs = [
  {
    question: "Is the there any recurring or hidden fees?",
    answer:
      "No. It is a one-time website activation payment. There is no monthly SimpleBookMe subscription.",
  },
  {
    question: "Can I review my website before paying?",
    answer:
      "Yes. You create the complete website first and receive both the public website link and private edit link. You then decide whether to activate it within a week.",
  },
  {
    question: "Can I update the website later?",
    answer:
      "Yes. Your private edit link allows you to update your services, content, pricing, schedule, photos, contact information, and other website details.",
  },
  {
    question: "Do I need coding or design experience?",
    answer:
      "No. Choose your business category, enter your information, select your services, and SimpleBookMe generates the website for you.",
  },
  {
    question: "Can I use another booking platform?",
    answer:
      "Yes. You can use the built-in email booking system or connect an external booking link such as Calendly, Fresha, Vagaro, or another platform.",
  },
  {
    question: "Will the website work on phones?",
    answer:
      "Yes. SimpleBookMe websites are designed to work across mobile phones, tablets, and desktop screens.",
  },
];

/* =====================================================
   SMALL COMPONENTS
   ===================================================== */

function CheckIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          d="M5 10.5 8.2 14 15 6.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function FeatureIcon() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="m5 12 4 4L19 6"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <FeatureIcon />

      <h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
    </article>
  );
}

/* =====================================================
   PAGE
   ===================================================== */

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
     SIMPLEBOOKME SALES PRICING PAGE
     ===================================================== */

  if (mode === "sales") {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden">
          <div className="mx-auto h-[650px] max-w-7xl rounded-b-[80px] bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        </div>

        {/* Header */}
        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-gray-900"
          >
            SimpleBookMe
          </Link>

          <button
            type="button"
            onClick={() => router.push("/setup")}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Create website
          </button>
        </header>

        {/* Hero */}
        <section className="px-6 pb-20 pt-16 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              One-time website activation
            </div>

            <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
              A professional booking website without another monthly bill
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Create your complete website, review it first, and activate it
              with one simple payment. Built for service businesses that need
              an easy way to present services and accept bookings.
            </p>
          </div>

          {/* Pricing card */}
          <div className="mx-auto mt-14 max-w-4xl">
            <div className="overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-2xl shadow-indigo-100/70">
              <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                {/* Price */}
                <div className="flex flex-col justify-center bg-gradient-to-br from-gray-950 to-indigo-950 p-8 text-white sm:p-12">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
                    Complete website activation
                  </p>

{/* OLD PRICING
<div className="mt-6">
  <div className="flex items-center gap-3">
    <span className="text-2xl font-bold text-gray-400 line-through">
      $59.90
    </span>

    <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-200">
      Launch discount
    </span>
  </div>

  <div className="mt-2 flex items-end gap-3">
    <span className="text-6xl font-extrabold tracking-tight">
      $19.90
    </span>

    <span className="pb-2 text-lg font-semibold text-gray-300">
      USD
    </span>
  </div>
</div>
*/}

<div className="mt-6">
  <span className="text-6xl font-extrabold tracking-tight">
    FREE
  </span>
</div>

<p className="mt-3 text-lg text-gray-300">
  Enjoy the free tier with lots of features.
</p>

                  <button
                    type="button"
                    onClick={() => router.push("/setup")}
                    className="mt-8 w-full rounded-2xl bg-white px-6 py-4 font-bold text-gray-950 transition hover:bg-indigo-50"
                  >
                    Create My Website
                  </button>

                  <p className="mt-4 text-center text-sm text-gray-400">
                    Build and review your website in minutes
                  </p>
                </div>

                {/* Included */}
                <div className="p-8 sm:p-12">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Everything you need to get online
                  </h2>

                  <div className="mt-7 space-y-4">
                    {[
                      "Unique public website link",
					  "100 appointments per month",
					  "Automatic appointment reminder",
					  "Automatic review reminder",
                      "Private website editing link",
                      "Built-in or external booking",
					  "Instant Quote tab",
                      "Services and pricing display",
                      "Weekly availability schedule",
                      "Photo and video portfolio",
                      "Custom logo and branding",
                      "Testimonials and Google reviews",
                      "Contact and social media links",
                      "Mobile-friendly website",
                      "Search-friendly website metadata",
                      "Edit your website anytime",
                    ].map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <CheckIcon />

                        <span className="pt-0.5 text-sm font-medium text-gray-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="border-y border-gray-100 bg-gray-50/70 px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
                Included features
              </p>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                More than a simple booking link
              </h2>

              <p className="mt-5 text-lg leading-8 text-gray-600">
                Create a complete online presence where customers can discover
                your services, view your work, check availability, and contact
                or book with you.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {salesFeatures.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
                How it works
              </p>

              <h2 className="mt-4 text-3xl font-extrabold text-gray-950 sm:text-4xl">
                Create first. Decide after you see it.
              </h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Enter your information",
                  description:
                    "Choose your business category and add your services, schedule, branding, photos, and contact details.",
                },
                {
                  number: "02",
                  title: "Review your website",
                  description:
                    "SimpleBookMe creates your public website and private edit link so you can inspect the result.",
                },
                {
                  number: "03",
                  title: "Free",
                  description:
                    "Use the website for free.",
                },
              ].map((item) => (
                <article
                  key={item.number}
                  className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"
                >
                  <div className="text-5xl font-black text-indigo-100">
                    {item.number}
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-gray-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Business types */}
        <section className="bg-gray-950 px-6 py-24 text-white lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">
                  Built for service businesses
                </p>

                <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  One flexible platform for many types of businesses
                </h2>

                <p className="mt-5 leading-8 text-gray-300">
                  Use your website for appointments, quote requests, portfolio
                  presentation, weekly availability, or directing customers to
                  another booking platform.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {businessTypes.map((business) => (
                  <div
                    key={business}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-gray-100"
                  >
                    {business}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-[32px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 sm:p-12">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
                    Simple pricing
                  </p>

                  <h2 className="mt-4 text-3xl font-extrabold text-gray-950">
                    Stop paying every month for features you barely use
                  </h2>

                  <p className="mt-5 leading-8 text-gray-600">
                    SimpleBookMe focuses on the practical features small service
                    businesses need: a professional website, service listings,
                    booking options, availability, a portfolio, and easy editing.
                  </p>
                </div>

                <div className="rounded-3xl bg-white p-7 shadow-lg shadow-indigo-100">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                    <span className="font-semibold text-gray-600">
                      Activation
                    </span>

                    <span className="font-bold text-gray-950">
                      Free
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 py-5">
                    <span className="font-semibold text-gray-600">
                      Monthly platform fee
                    </span>

                    <span className="font-bold text-emerald-600">$0</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 py-5">
                    <span className="font-semibold text-gray-600">
                      Preview before payment
                    </span>

                    <span className="font-bold text-emerald-600">Included</span>
                  </div>

                  <div className="flex items-center justify-between pt-5">
                    <span className="font-semibold text-gray-600">
                      Future editing
                    </span>

                    <span className="font-bold text-emerald-600">Included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-gray-100 bg-gray-50 px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
                Questions and answers
              </p>

              <h2 className="mt-4 text-3xl font-extrabold text-gray-950 sm:text-4xl">
                Frequently asked questions
              </h2>
            </div>

            <div className="mt-12 space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-gray-900">
                    {faq.question}

                    <span className="text-2xl font-light text-indigo-600 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <p className="mt-4 max-w-3xl leading-7 text-gray-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[36px] bg-gradient-to-br from-indigo-600 to-purple-700 px-8 py-16 text-center text-white shadow-2xl shadow-indigo-200 sm:px-14">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              See your website before you pay
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-indigo-100">
              Create your website, explore the public page and editing tools,
              and activate it only after you are satisfied.
            </p>

            <button
              type="button"
              onClick={() => router.push("/setup")}
              className="mt-8 rounded-2xl bg-white px-8 py-4 font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              Create My Booking Website
            </button>

            <p className="mt-4 text-sm text-indigo-200">
              Free
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 px-6 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row">
            <p>
              © {new Date().getFullYear()} SimpleBookMe. All rights reserved.
            </p>

            <div className="flex gap-6">
              <Link href="/" className="transition hover:text-gray-900">
                Home
              </Link>

              <Link
                href="/support"
                className="transition hover:text-gray-900"
              >
                Support
              </Link>

              <Link
                href="/qr-code-generator"
                className="transition hover:text-gray-900"
              >
                Free tools
              </Link>
            </div>
          </div>
        </footer>
      </main>
    );
  }

  /* =====================================================
     CLIENT WEBSITE PRICING PAGE
     ===================================================== */

  const customerConfig = customer as CustomerConfig;
  const pricing = customerConfig.pricing;

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