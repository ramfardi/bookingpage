"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdvertisingBudgetCalculatorPage() {
  const router = useRouter();

  const [pricePerVisit, setPricePerVisit] = useState<number>(80);
  const [visitsPerMonth, setVisitsPerMonth] = useState<number>(60);
  const [costPerService, setCostPerService] = useState<number>(25);

  const [calculated, setCalculated] = useState<boolean>(false);

  const monthlyRevenue = pricePerVisit * visitsPerMonth;
  const monthlyServiceCost = costPerService * visitsPerMonth;
  const monthlyProfitBeforeAds = monthlyRevenue - monthlyServiceCost;

  // Safe advertising recommendation logic:
  // Recommend 10%–20% of revenue depending on margin
  const profitMargin = monthlyProfitBeforeAds / monthlyRevenue;

  let recommendedAdBudget = 0;

  if (profitMargin >= 0.5) {
    recommendedAdBudget = monthlyRevenue * 0.2;
  } else if (profitMargin >= 0.3) {
    recommendedAdBudget = monthlyRevenue * 0.15;
  } else {
    recommendedAdBudget = monthlyRevenue * 0.1;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-24 flex justify-center">
      <div className="w-full max-w-4xl">

        <div className="mb-8">
          <Link
            href="/guide"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back to Business Guide
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Advertising Budget Calculator for Small Businesses
        </h1>

        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          This calculator helps you understand how much you can safely spend
          on advertising based on your real business numbers.
          No marketing jargon — just simple business math.
        </p>

        {/* Calculator Box */}
        <div className="mt-12 bg-gray-50 p-8 rounded-2xl border">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Enter Your Business Details
          </h2>

          <div className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Average Price Per Visit ($)
              </label>
              <input
                type="number"
                value={pricePerVisit}
                onChange={(e) => setPricePerVisit(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Average Number of Visits Per Month
              </label>
              <input
                type="number"
                value={visitsPerMonth}
                onChange={(e) => setVisitsPerMonth(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Cost Per Service Visit ($)
              </label>
              <input
                type="number"
                value={costPerService}
                onChange={(e) => setCostPerService(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border px-4 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include materials, supplies, assistant wages, etc.
              </p>
            </div>

          </div>

          <button
            onClick={() => setCalculated(true)}
            className="mt-8 rounded-xl bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition"
          >
            Calculate Recommended Advertising Budget
          </button>

          {calculated && (
            <div className="mt-10 space-y-4 text-gray-800">

              <p>
                <strong>Estimated Monthly Revenue:</strong>{" "}
                ${monthlyRevenue.toFixed(0)}
              </p>

              <p>
                <strong>Total Monthly Service Costs:</strong>{" "}
                ${monthlyServiceCost.toFixed(0)}
              </p>

              <p>
                <strong>Monthly Profit Before Advertising:</strong>{" "}
                ${monthlyProfitBeforeAds.toFixed(0)}
              </p>

              <p className="text-indigo-700 text-lg font-semibold">
                Recommended Monthly Advertising Budget: $
                {recommendedAdBudget.toFixed(0)}
              </p>

            </div>
          )}

        </div>

        {/* Educational Content */}

        <div className="mt-16 space-y-8 text-gray-700 leading-relaxed">

          <h2 className="text-2xl font-semibold text-gray-900">
            How This Recommendation Works
          </h2>

          <p>
            Instead of guessing how much to spend on advertising, this calculator
            uses your real profit margin. Businesses with higher margins can
            safely invest more in advertising because they retain more profit
            from each sale.
          </p>

          <p>
            For most small service businesses, spending between 10% and 20%
            of monthly revenue on advertising is considered sustainable.
            If your profit margin is lower, you should spend closer to 10%.
            If your margin is high, you can invest more aggressively.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900">
            Why Advertising Should Be Based on Profit — Not Emotion
          </h2>

          <p>
            Many business owners either overspend on ads hoping for growth,
            or underspend because they are afraid. Neither approach is strategic.
            The right approach is controlled, sustainable investment.
          </p>

          <p>
            When your advertising budget is based on real profit,
            growth becomes predictable instead of risky.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900">
            How to Use This Budget
          </h2>

          <ul className="list-disc pl-6 space-y-3">
            <li>Split across Google Ads and social media</li>
            <li>Test small campaigns first</li>
            <li>Track new bookings carefully</li>
            <li>Increase spending only when profitable</li>
          </ul>

        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">
          <h3 className="text-2xl font-semibold text-gray-900">
            Turn Advertising Into Real Bookings
          </h3>

          <p className="mt-4 text-gray-600">
            Combine smart budgeting with an online booking website to maximize
            conversion and reduce missed opportunities.
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
