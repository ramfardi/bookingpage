"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

export default function GettingFirstClientsGuidePage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<
    CustomerConfig | LandingConfig | null
  >(null);

  const [mode, setMode] = useState<"sales" | "client">("sales");

  useEffect(() => {
    async function load() {
      const hostname = window.location.hostname;
      const result = await getCustomerConfigFromHost(hostname);
      setCustomer(result.config);
      setMode(result.mode);
    }

    load();
  }, []);

  if (!customer) return null;

  /* =======================
     SALES MODE
     ======================= */
  if (mode === "sales") {
    return (
      <main className="min-h-screen bg-white px-6 py-24 flex justify-center">
        <div className="w-full max-w-4xl">

          {/* Back */}
          <div className="mb-8">
            <Link
              href="/guide"
              className="text-sm text-indigo-600 hover:underline"
            >
              ← Back to Business Guide
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            How to Get Your First Clients
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Getting your first clients is the hardest phase of starting a
            business. Whether you are a hairdresser, cleaner, massage
            therapist, nail technician, or any service provider, the beginning
            feels slow and uncertain.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            The good news is this: your first 10–20 clients do not come from
            complicated marketing strategies. They come from focused action,
            local visibility, and trust building.
          </p>

          {/* Image Placeholder */}
          <div className="mt-12">
            <Image
              src="/images/guide/clients/first-clients-strategy.png"
              alt="First client acquisition strategy for small business"
              width={900}
              height={500}
              className="rounded-2xl border object-cover w-full h-auto"
              priority
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Example roadmap for acquiring your first clients
            </p>
          </div>

          {/* Section 1 */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Step 1: Start With People You Already Know
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Your first clients often come from your existing network.
            Friends, family, former coworkers, and neighbors already trust you.
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Post on your personal social media</li>
            <li>Send a simple message announcing your service</li>
            <li>Offer a limited launch discount</li>
            <li>Ask for referrals immediately after service</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            The goal is not to make huge profit in the beginning. The goal is
            to build momentum and testimonials.
          </p>

          {/* Section 2 */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Step 2: Optimize Your Google Presence
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            If you haven’t already, create your Google Business Profile.
            Many first-time clients search directly on Google Maps.
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Add real photos of your work</li>
            <li>Fill every section completely</li>
            <li>Ask your first customers for reviews</li>
            <li>Respond to every review professionally</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Even 5 strong reviews can dramatically increase trust.
          </p>

          {/* Section 3 */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Step 3: Offer a Limited-Time Intro Offer
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            People are more likely to try a new service if there is a clear
            reason to act now.
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>20% off for first-time customers</li>
            <li>Free add-on service</li>
            <li>Referral discount for both parties</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Make sure the offer has a deadline. Urgency increases action.
          </p>

          {/* Section 4 */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Step 4: Use Social Proof
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Early testimonials matter more than advertising. Ask every satisfied
            customer for:
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>A short written review</li>
            <li>A before/after photo (with permission)</li>
            <li>A recommendation post</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Display these clearly on your booking page.
          </p>

          {/* Section 5 */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Step 5: Be Extremely Responsive
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Speed wins in the beginning. Reply quickly to inquiries.
            Use online booking to remove friction.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Many small businesses lose clients simply because they respond too
            slowly.
          </p>

          {/* Section 6 */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Offline Strategies That Still Work
          </h2>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Partner with nearby businesses</li>
            <li>Leave flyers in strategic locations</li>
            <li>Offer collaboration discounts</li>
            <li>Attend local community events</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Local service businesses grow through visibility and relationships.
          </p>

          {/* Section 7 */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Avoid These Common Mistakes
          </h2>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Waiting for perfect branding before launching</li>
            <li>Underpricing out of fear</li>
            <li>Ignoring reviews</li>
            <li>Making booking complicated</li>
          </ul>

          {/* Section 8 */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            The 30-Day Action Plan
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Week 1: Launch announcement + contact network  
            Week 2: Collect 3–5 reviews  
            Week 3: Run referral incentive  
            Week 4: Improve online presence + testimonials
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Small consistent actions outperform big rare campaigns.
          </p>

          {/* CTA */}
          <div className="mt-14 p-8 bg-gray-50 rounded-2xl text-center">
            <h3 className="text-2xl font-semibold text-gray-900">
              Make It Easy for Clients to Book You
            </h3>

            <p className="mt-4 text-gray-600">
              The easier you make booking, the more clients you convert.
              Use an online booking system so customers can schedule instantly.
            </p>

            <button
              onClick={() => router.push("/setup")}
              className="mt-6 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
            >
              Create Your Booking Website
            </button>
          </div>

        </div>
      </main>
    );
  }

  /* =======================
     CLIENT MODE
     ======================= */
  return (
    <main className="min-h-screen px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">
        How to Get Your First Clients
      </h1>
      <p className="mt-4 text-gray-500">
        This guide is only visible on the main website.
      </p>
    </main>
  );
}
