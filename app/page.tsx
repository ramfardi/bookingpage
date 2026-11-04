
import HomePage from "@/components/HomePage";
import AvailabilityPage from "@/components/AvailabilityPage";
import CleaningGetQuotePage from "@/components/CleaningGetQuotePage";
import PricingPage from "@/components/PricingPage";

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getSiteFromHost } from "./lib/getSiteFromHost";
import { getSiteCleaningQuote } from "./lib/getSiteCleaningQuote";
import { getSitePricing } from "./lib/getSitePricing";
import { getCustomerServer } from "./lib/getCustomerServer";
import { generateSeo } from "./lib/generateSeo";

/* =====================================================
   HELPERS
===================================================== */

function isMainWebsite(host: string): boolean {
  const normalizedHost = host.trim().toLowerCase();

  return (
    normalizedHost === "simplebookme.com" ||
    normalizedHost === "www.simplebookme.com" ||
    normalizedHost.includes("localhost") ||
    normalizedHost.includes("vercel.app")
  );
}

/* =====================================================
   NEW: CLEANING QUOTE EXPIRED PAGE

   Displayed when:
   - The 14-day trial expires
   - Billing verification is temporarily unavailable

   Does not expose the private activation token.
===================================================== */

function CleaningQuoteInactive({
  status,
}: {
  status: "expired" | "unavailable" | string;
}) {
  const expired = status === "expired";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 via-white to-indigo-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/50 sm:p-10">

        {/* SIMPLEBOOKME BRAND */}
        <div className="mb-7">
          <a
            href="https://simplebookme.com"
            className="text-xl font-extrabold tracking-tight text-indigo-600"
          >
            SimpleBookMe
          </a>
        </div>

        {/* STATUS ICON */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
          {expired ? "⏳" : "🔧"}
        </div>

        {/* TITLE */}
        <h1 className="mt-6 text-2xl font-extrabold text-slate-950">
          {expired
            ? "This Cleaning Quote Page Is Temporarily Inactive"
            : "This Cleaning Quote Page Is Temporarily Unavailable"}
        </h1>

        {/* DESCRIPTION */}
        {expired ? (
          <>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              The free trial for this Cleaning Quote Page
              has ended.
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              The business owner can reactivate this page
              using the activation link provided by
              SimpleBookMe.
            </p>

            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-left">
              <p className="text-sm font-semibold text-indigo-950">
                Are you the business owner?
              </p>

              <p className="mt-2 text-sm leading-6 text-indigo-800">
                Check your SimpleBookMe welcome email
                for your activation link.
                Your existing page and settings
                will be preserved.
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This Cleaning Quote Page is temporarily
              unavailable.
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Please try again later.
            </p>
          </>
        )}

        <div className="mt-8 border-t border-slate-100 pt-6">
          <a
            href="https://simplebookme.com"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Visit SimpleBookMe
          </a>
        </div>

      </div>
    </main>
  );
}

/* =====================================================
   GENERATE METADATA
===================================================== */

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host") || "";

  /* ================================================
     1. CLEANING QUOTE WEBSITE SEO
  ================================================= */

  const siteCleaning = await getSiteCleaningQuote(host);

  if (siteCleaning) {

    // NEW: Do not index expired or unavailable pages.
    if (!siteCleaning.billing.allowed) {
      return {
        title: "Cleaning Quote Page Unavailable | SimpleBookMe",

        description:
          "This cleaning quote page is temporarily unavailable.",

        robots: {
          index: false,
          follow: false,
        },
      };
    }

    // Original cleaning quote SEO.
    const cleaningData = siteCleaning.data;

    const businessName =
      typeof cleaningData.businessName === "string"
        ? cleaningData.businessName.trim() || "Cleaning Services"
        : "Cleaning Services";

    const serviceArea =
      typeof cleaningData.serviceArea === "string"
        ? cleaningData.serviceArea.trim()
        : "";

    const locationText = serviceArea
      ? ` in ${serviceArea}`
      : "";

    const title =
      `${businessName} | Instant Cleaning Quote`;

    const description =
      `Get an instant cleaning estimate from ${businessName}${locationText}. ` +
      `Explore house, apartment, townhouse, and commercial cleaning options ` +
      `and request your preferred appointment.`;

    const hostname = host
      .trim()
      .toLowerCase()
      .replace(/:\d+$/, "");

    const canonical = `https://${hostname}/`;

    return {
      title,
      description,

      alternates: {
        canonical,
      },

      robots: {
        index: true,
        follow: true,
      },

      openGraph: {
        title,
        description,
        url: canonical,
        siteName: businessName,
        type: "website",
      },
    };
  }

  /* ================================================
     2. AVAILABILITY WEBSITE SEO
  ================================================= */

  const siteAvailability = await getSiteFromHost(host);

  if (siteAvailability) {
    const businessName =
      siteAvailability.data.businessName?.trim() ||
      "Availability";

    const title =
      `${businessName} | Weekly Availability`;

    const description =
      `View weekly availability for ${businessName} and contact the business to arrange an appointment.`;

    const hostname = host
      .trim()
      .toLowerCase()
      .replace(/:\d+$/, "");

    const canonical = `https://${hostname}/`;

    return {
      title,
      description,

      alternates: {
        canonical,
      },

      robots: {
        index: true,
        follow: true,
      },

      openGraph: {
        title,
        description,
        url: canonical,
        siteName: businessName,
        type: "website",
      },
    };
  }

  /* ================================================
     3. PRICING PAGE SEO
  ================================================= */

  const sitePricing = await getSitePricing(host);

  if (sitePricing) {
    const businessName =
      sitePricing.data.businessName || "Our services";

    const title =
      `${businessName} | Services & Pricing`;

    const description =
      `View services and pricing for ${businessName}.`;

    const canonical =
      `https://simplebookme.com/pricing_page/${sitePricing.siteId}`;

    return {
      title,
      description,

      alternates: {
        canonical,
      },

      robots: {
        index: true,
        follow: true,
      },

      openGraph: {
        title,
        description,
        url: canonical,
        siteName: businessName,
        type: "website",
      },
    };
  }

  /* ================================================
     4. BOOKING WEBSITE / MAIN WEBSITE SEO
  ================================================= */

  const customer = await getCustomerServer(host);

  const mainSite = isMainWebsite(host);

  if (!customer && !mainSite) {
    return {
      title: "Site Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // MAIN SIMPLEBOOKME WEBSITE
  if (!customer && mainSite) {
    return {
      metadataBase: new URL("https://simplebookme.com"),

      title:
        "Booking Website Builder for Cleaners, Salons & Service Businesses | SimpleBookMe",

      description:
        "Create a professional booking website for your cleaning business, salon, handyman service, or freelance business. Accept online bookings, share your availability, and get customers fast.",

      alternates: {
        canonical: "https://simplebookme.com/",
      },

      robots: {
        index: true,
        follow: true,
      },

      openGraph: {
        title:
          "Booking Website Builder for Service Businesses | SimpleBookMe",

        description:
          "Create a professional booking website with scheduling, quote tools, and availability pages.",

        url: "https://simplebookme.com",

        siteName: "SimpleBookMe",

        images: [
          {
            url: "https://simplebookme.com/images/og-home.jpg",
            width: 1200,
            height: 630,
            alt: "SimpleBookMe Homepage",
          },
        ],

        locale: "en_US",
        type: "website",
      },
    };
  }

  if (!customer) {
    return {
      title: "Site Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // CUSTOMER BOOKING WEBSITE
  const seo =
    customer.seo || generateSeo(customer);

  return {
    title: seo.title,

    description: seo.description,

    keywords: seo.keywords,

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title: seo.title,

      description: seo.description,

      url:
        `https://${customer.subdomain}.simplebookme.com`,

      siteName: customer.businessName,
    },

    alternates: {
      canonical:
        `https://${customer.subdomain}.simplebookme.com`,
    },
  };
}

/* =====================================================
   MAIN PAGE ROUTING
===================================================== */

export default async function Page() {
  const host = (await headers()).get("host") || "";

  const mainSite = isMainWebsite(host);

  // Keep existing product loaders.
  const site = await getSiteFromHost(host);
  const siteCleaning = await getSiteCleaningQuote(host);
  const sitePricing = await getSitePricing(host);

  /* ================================================
     PRIORITY 1: CLEANING QUOTE
  ================================================= */

  if (siteCleaning) {

    // NEW: Check trial expiration and payment status.
    if (!siteCleaning.billing.allowed) {
      return (
        <CleaningQuoteInactive
          status={siteCleaning.billing.status}
        />
      );
    }

    // Trial active, paid, or legacy:
    // display the original Cleaning Quote page.
    return (
      <CleaningGetQuotePage
        data={siteCleaning.data}
      />
    );
  }

  /* ================================================
     PRIORITY 2: AVAILABILITY
  ================================================= */

  if (site) {
    return (
      <AvailabilityPage
        data={site.data}
      />
    );
  }

  /* ================================================
     PRIORITY 3: PRICING PAGE
  ================================================= */

  if (sitePricing) {
    return (
      <PricingPage
        data={sitePricing.data}
      />
    );
  }

  /* ================================================
     PRIORITY 4: BOOKING WEBSITE
  ================================================= */

  const customer = await getCustomerServer(host);

  if (customer) {
    return (
      <HomePage
        activeCustomer={customer}
      />
    );
  }

  /* ================================================
     UNKNOWN SUBDOMAIN
  ================================================= */

  if (!mainSite) {
    notFound();
  }

  /* ================================================
     MAIN SIMPLEBOOKME WEBSITE
  ================================================= */

  return <HomePage />;
}
