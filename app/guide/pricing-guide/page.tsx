"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

export default function PricingGuidePage() {
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

          {/* Back Link */}
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
            How to Set Your Prices Properly
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Pricing is one of the most difficult decisions for new solo
            business owners. Whether you are a hairdresser, cleaner, massage
            therapist, nail technician, or any service provider, setting your
            prices incorrectly can either scare away customers or leave you
            overworked and underpaid.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Many beginners make the mistake of copying competitors without
            understanding their own costs. Others underprice themselves out of
            fear. The goal is not to be the cheapest. The goal is to be
            sustainable, profitable, and competitive.
          </p>

          {/* Image Placeholder */}
          <div className="mt-12">
            <Image
              src="/images/guide/pricing/pricing-calculator.png"
              alt="Service pricing calculator and cost breakdown example"
              width={900}
              height={500}
              className="rounded-2xl border object-cover w-full h-auto"
              priority
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Example of calculating service costs and profit margins
            </p>
          </div>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Why Proper Pricing Matters
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Your pricing determines your income, your stress level, and your
            long-term business stability. If you charge too little, you will
            need too many clients just to survive. If you charge too much
            without delivering value, you will struggle to get bookings.
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Protects your profit margin</li>
            <li>Prevents burnout</li>
            <li>Builds perceived value</li>
            <li>Supports long-term growth</li>
          </ul>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Step 1: Calculate Your Real Costs
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Before choosing a price, calculate your total monthly expenses.
            This includes rent, utilities, supplies, software, insurance,
            transportation, marketing, and payment processing fees.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Example:
          </p>

          <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
            <li>Rent: $1,200</li>
            <li>Supplies: $300</li>
            <li>Insurance: $100</li>
            <li>Software & tools: $100</li>
            <li>Miscellaneous: $300</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Total monthly expenses: $2,000
          </p>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Step 2: Decide Your Target Income
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Determine how much you want to earn per month after expenses.
            Suppose your target income is $4,000.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Total revenue required:
            $2,000 (expenses) + $4,000 (income) = $6,000 per month.
          </p>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Step 3: Calculate Required Hourly Rate
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Estimate how many billable hours you realistically work per month.
            If you work 25 hours per week:
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            25 hours × 4 weeks = 100 billable hours.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            $6,000 ÷ 100 hours = $60 per hour.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            This means you must average $60 per hour to reach your goal.
          </p>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Service-Based vs Hourly Pricing
          </h2>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Hourly Pricing
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Simple and transparent, but may limit earnings if you become faster
            and more efficient.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Service-Based Pricing
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Charges per service (e.g., $75 haircut). Allows higher profit if
            you optimize your workflow.
          </p>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Research Your Market
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Check competitors in your area. Compare:
          </p>

          <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
            <li>Experience level</li>
            <li>Location quality</li>
            <li>Online reviews</li>
            <li>Service packages</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Do not automatically match the lowest price. Instead, position
            yourself strategically.
          </p>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Pricing Strategies That Work
          </h2>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            1. Tiered Pricing
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Offer Basic, Standard, and Premium packages.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            2. Add-On Services
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Upsell small extras that increase average ticket value.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            3. Price Anchoring
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Display higher-priced services first to make mid-tier options
            attractive.
          </p>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Common Pricing Mistakes
          </h2>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Copying competitors blindly</li>
            <li>Ignoring hidden costs</li>
            <li>Never raising prices</li>
            <li>Charging based on emotion</li>
          </ul>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            When to Raise Your Prices
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            If you are fully booked, consistently receiving positive reviews,
            or increasing your skill level, it may be time to adjust your
            pricing.
          </p>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Final Thoughts
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Proper pricing is not about being cheap or expensive. It is about
            being sustainable. Calculate your numbers, test your market, and
            adjust strategically.
          </p>

          {/* CTA */}
          <div className="mt-14 p-8 bg-gray-50 rounded-2xl text-center">
            <h3 className="text-2xl font-semibold text-gray-900">
              Ready to Turn Visitors Into Paying Clients?
            </h3>

            <p className="mt-4 text-gray-600">
              Use clear pricing together with an online booking system to
              increase conversions and reduce confusion.
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
        How to Set Your Prices Properly
      </h1>
      <p className="mt-4 text-gray-500">
        This guide is only visible on the main website.
      </p>
    </main>
  );
}
