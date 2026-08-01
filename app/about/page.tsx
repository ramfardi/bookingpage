"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

type PageMode = "sales" | "client";
type PageConfig = CustomerConfig | LandingConfig;

const features = [
  "A professional, mobile-friendly booking website",
  "Your own unique public website link",
  "A private link for editing and managing your website",
  "Email-based booking requests without requiring client accounts",
  "Automatic booking confirmation emails",
  "Calendar (.ics) attachments for you and your clients",
  "Support for external booking platforms such as Fresha and Vagaro",
  "Customizable services, descriptions, pricing, and business information",
  "Pre-built services based on your business category",
  "Business logo, branding, contact information, and service area",
  "Photo galleries and before-and-after examples",
  "Search-engine-friendly website information",
  "A website that can be updated whenever your business changes",
  "A one-time activation cost with no required monthly subscription",
];

export default function AboutPage() {
  const [customer, setCustomer] = useState<PageConfig | null>(null);
  const [mode, setMode] = useState<PageMode>("sales");

  useEffect(() => {
    let isMounted = true;

    async function loadCustomer() {
      try {
        const hostname = window.location.hostname;
        const result = await getCustomerConfigFromHost(hostname);

        if (!isMounted) return;

        setCustomer(result.config);
        setMode(result.mode);
      } catch (error) {
        console.error("Unable to load About page configuration:", error);
      }
    }

    loadCustomer();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!customer) return null;

  if (mode === "sales") {
    return <SalesAboutPage />;
  }

  return <ClientAboutPage customer={customer as CustomerConfig} />;
}

/* =====================================================
   SALES ABOUT PAGE
   ===================================================== */

function SalesAboutPage() {
  return (
    <main className="w-full bg-white">
      {/* HERO */}
      <section className="bg-gradient-to-b from-indigo-50 to-white px-6 pb-14 pt-16 text-center md:pb-20 md:pt-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-600">
            About us
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            About SimpleBookMe
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            A simple and affordable way for independent professionals and small
            businesses to create a professional website and accept bookings
            online.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl space-y-20">
          {/* WHAT IT IS */}
          <section>
            <h2 className="mb-5 text-2xl font-bold text-gray-900 md:text-3xl">
              What is SimpleBookMe?
            </h2>

            <div className="space-y-4 text-lg leading-relaxed text-gray-700">
              <p>
                SimpleBookMe helps small businesses and independent
                professionals create a clean, mobile-friendly booking website
                without complicated software, technical setup, or an expensive
                monthly subscription.
              </p>

              <p>
                You receive a public link that can be shared with clients and a
                private editing link that allows you to update your services,
                pricing, photos, business information, and other website
                content.
              </p>
            </div>
          </section>

          {/* BOOKING OPTIONS */}
          <section>
            <h2 className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl">
              Choose how clients book
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <article className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  Email-based booking
                </h3>

                <p className="mt-4 leading-relaxed text-gray-700">
                  Clients submit a booking request using a simple form. You
                  receive the requested service, preferred date and time, and
                  client information by email.
                </p>

                <p className="mt-4 leading-relaxed text-gray-700">
                  Both you and your client receive confirmation emails, including
                  a calendar file that can be added to compatible calendar
                  applications.
                </p>
              </article>

              <article className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  External booking system
                </h3>

                <p className="mt-4 leading-relaxed text-gray-700">
                  Already using Fresha, Vagaro, Calendly, Square, or another
                  booking service? Add your existing booking link and clients
                  will be redirected there when they select the booking button.
                </p>

                <p className="mt-4 leading-relaxed text-gray-700">
                  This lets you keep your current booking workflow while using
                  SimpleBookMe as your professional business website.
                </p>
              </article>
            </div>
          </section>

          {/* FEATURES */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Features included
              </h2>

              <p className="mt-3 text-lg text-gray-600">
                Everything needed to present your business professionally and
                make it easier for clients to contact or book with you.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700"
                  >
                    ✓
                  </span>

                  <span className="leading-relaxed text-gray-800">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* WHY SIMPLEBOOKME */}
          <section className="rounded-3xl bg-gray-900 px-7 py-10 text-white md:px-12 md:py-14">
            <h2 className="text-2xl font-bold md:text-3xl">
              Built for small businesses
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-300">
              SimpleBookMe focuses on the features that independent
              professionals actually need. You can build and preview your
              website, share it with clients, and continue updating it as your
              business grows—without learning web design or managing complicated
              software.
            </p>
          </section>

          {/* CUSTOM FEATURES */}
          <section className="rounded-3xl border border-indigo-200 bg-indigo-50 px-7 py-10 text-center md:px-12 md:py-14">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Need a custom feature?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-700">
              Every business works differently. If you are interested in a
              custom feature designed for your business, we are open to
              discussing and implementing it.
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-gray-700">
              Tell us what your business needs through our support page.
            </p>

            <Link
              href="/support"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-7 py-3.5 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Contact us through support
            </Link>

            <p className="mt-4 text-sm text-gray-600">
              simplebookme.com/support
            </p>
          </section>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} SimpleBookMe
      </footer>
    </main>
  );
}

/* =====================================================
   CLIENT ABOUT PAGE
   ===================================================== */

function ClientAboutPage({ customer }: { customer: CustomerConfig }) {
  const { about, heroImage, businessName } = customer;

  return (
    <main className="min-h-screen w-full">
      {/* HERO */}
      <section
        className="relative flex min-h-[55vh] items-center justify-center bg-cover bg-center px-6 text-center text-white"
        style={{
          backgroundImage: `url(${
            heroImage || "/images/hero-default.png"
          })`,
        }}
      >
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            {about.title}
          </h1>
        </div>
      </section>

      {/* CONTENT */}
      <section className="bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl space-y-14">
          <p className="text-lg leading-relaxed text-gray-700">
            {about.description}
          </p>

          {about.highlights?.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {about.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3 rounded-xl bg-gray-50 p-5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 text-lg text-indigo-600"
                  >
                    ✓
                  </span>

                  <span className="text-gray-800">{highlight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {businessName}
      </footer>
    </main>
  );
}