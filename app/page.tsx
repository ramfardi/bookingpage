import HomePage from "@/components/HomePage";
import AvailabilityPage from "@/components/AvailabilityPage";
import CleaningGetQuotePage from "@/components/CleaningGetQuotePage";
import { headers } from "next/headers";
import { getSiteFromHost } from "./lib/getSiteFromHost";
import { getSiteCleaningQuote } from "./lib/getSiteCleaningQuote";

import { getCustomerServer } from "./lib/getCustomerServer";
import { generateSeo } from "./lib/generateSeo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata() {
  const host =
    (await headers()).get("host") || "";

  const customer =
    await getCustomerServer(host);
	
	const isMainSite =
  host === "simplebookme.com" ||
  host === "www.simplebookme.com" ||
  host.includes("localhost") ||
  host.includes("vercel.app");
  
  if (!customer && !isMainSite) {
  return {
    title: "Site Not Found",
    robots: {
      index: false,
      follow: false,
    },
  };
}

  // MAIN SIMPLEBOOKME SITE
  if (!customer && isMainSite) {
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

  // CUSTOMER SUBDOMAIN
  const seo =
    customer.seo ||
    generateSeo(customer);

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

      url: `https://${customer.subdomain}.simplebookme.com`,

      siteName: customer.businessName,
    },

    alternates: {
      canonical: `https://${customer.subdomain}.simplebookme.com`,
    },
  };
}

export default async function Page() {
  const host = (await headers()).get("host") || "";
  const isMainSite =
    host === "simplebookme.com" ||
    host === "www.simplebookme.com" ||
    host.includes("localhost") ||
    host.includes("vercel.app");

  // 🔥 try both
  const site = await getSiteFromHost(host);
  const siteCleaning = await getSiteCleaningQuote(host);

  // 🔥 PRIORITY 1: cleaning quote
  if (siteCleaning) {
    return <CleaningGetQuotePage data={siteCleaning.data} />;
  }

  // 🔥 PRIORITY 2: availability
  if (site) {
    return <AvailabilityPage data={site.data} />;
  }

  // 🔥 fallback: homepage
  const customer =
  await getCustomerServer(host);

if (customer) {
  return (
    <HomePage
      activeCustomer={customer}
    />
  );
}

// Unknown subdomain → 404
if (!isMainSite) {
  notFound();
}

// Main site → homepage
return <HomePage />;
}