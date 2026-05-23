import HomePage from "@/components/HomePage";
import AvailabilityPage from "@/components/AvailabilityPage";
import CleaningGetQuotePage from "@/components/CleaningGetQuotePage";
import { headers } from "next/headers";
import { getSiteFromHost } from "./lib/getSiteFromHost";
import { getSiteCleaningQuote } from "./lib/getSiteCleaningQuote";

import type { Metadata } from "next";

export const metadata: Metadata = {
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

export default async function Page() {
  const host = (await headers()).get("host") || "";


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
  return <HomePage />;
}