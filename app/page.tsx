import HomePage from "@/components/HomePage";
import AvailabilityPage from "@/components/AvailabilityPage";
import { headers } from "next/headers";
import { getSiteFromHost } from "./lib/getSiteFromHost";

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

  // 🔥 detect subdomain
  const site = await getSiteFromHost(host);

  // ✅ If NO subdomain → show your normal homepage
  if (!site) {
    return <HomePage />;
  }

  // ✅ If subdomain → show availability
  const data = site.data;

  // ✅ subdomain → availability page
  return <AvailabilityPage data={site.data} />;
}