import HomePage from "@/components/HomePage";
import AvailabilityPage from "@/components/AvailabilityPage";
import CleaningGetQuotePage from "@/components/CleaningGetQuotePage";
import { headers } from "next/headers";
import { getSiteFromHost } from "./lib/getSiteFromHost";
import { getSiteCleaningQuote } from "./lib/getSiteCleaningQuote";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SimpleBookMe | Create a Booking Website in Minutes",
  description:
    "SimpleBookMe helps service businesses create a professional booking website with online appointments and instant confirmations.",
  alternates: {
    canonical: "https://simplebookme.com/",
  },
  robots: {
    index: true,
    follow: true,
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