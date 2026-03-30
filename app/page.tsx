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
  <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 flex justify-center">
    <div className="max-w-xl w-full space-y-6">

      {/* HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {data.businessName || "Availability"}
        </h1>

        <p className="text-gray-500 text-sm">
          Weekly availability schedule
        </p>

        <div className="inline-block mt-2 px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full">
          Updated in real-time
        </div>
      </div>

      {/* CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">

        {/* DAYS */}
        <div className="space-y-3">
          {data.selectedDays.map((day: string) => (
            <div
              key={day}
              className="flex justify-between items-center p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition"
            >
              <span className="font-medium text-gray-800">
                {day}
              </span>

              <span className="text-indigo-600 font-medium">
                {data.dayTimes[day].start} - {data.dayTimes[day].end}
              </span>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-6 pt-6 border-t text-center space-y-2">
          <p className="text-sm text-gray-500">
            Contact to book an appointment
          </p>

          <p className="text-xs text-gray-400">
            Powered by SimpleBookMe
          </p>
        </div>

      </div>

    </div>
  </main>
);
}