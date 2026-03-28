import HomePage from "@/components/HomePage";
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

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center">
        {data.businessName}
      </h1>

      <div className="mt-6 space-y-4">
        {data.selectedDays.map((day: string) => (
          <div
            key={day}
            className="flex justify-between border p-4 rounded-lg"
          >
            <span className="font-medium">{day}</span>
            <span className="text-indigo-600">
              {data.dayTimes[day].start} - {data.dayTimes[day].end}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}