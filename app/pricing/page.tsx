"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

export default function PricingPage() {
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

  // Prevent hydration mismatch
  if (!customer) return null;

  /* =======================
     SALES PRICING PAGE
     ======================= */
  if (mode === "sales") {
    return (
      <main className="min-h-screen bg-white px-6 py-24 flex justify-center">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Simple, transparent pricing
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            One-time payment. No subscriptions. No surprises.
          </p>

          {/* Pricing Card */}
          <div className="mt-12 rounded-3xl border shadow-sm p-10">
            <div className="text-sm uppercase tracking-wide text-gray-500">
              One-time fee
            </div>

            <div className="mt-4 flex justify-center items-end">
              <span className="text-5xl font-extrabold text-gray-900">
                $39.90
              </span>
              <span className="ml-2 text-lg text-gray-500">
                USD
              </span>
            </div>

            <p className="mt-2 text-gray-600">
              No monthly or recurring fees
            </p>

            <div className="my-8 border-t" />

            <div className="text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What’s included
              </h2>

              <ul className="space-y-3 text-gray-700">
                <li>✔️ Your own booking website with a unique link</li>
                <li>✔️ Free preview before purchase</li>
                <li>✔️ Test bookings before going live</li>
                <li>✔️ Pre-built services based on your business category</li>
                <li>✔️ Customize content, services, and pricing</li>
                <li>✔️ Built-in email booking or external booking link</li>
                <li>✔️ Edit and update your website anytime</li>
                <li>✔️ Changes apply instantly to the same link</li>
                <li>✔️ No monthly or hidden fees</li>
              </ul>
            </div>

            <div className="mt-10">
              <button
                onClick={() => router.push("/setup")}
                className="w-full rounded-xl bg-indigo-600 text-white py-4 font-semibold hover:bg-indigo-700 transition"
              >
                Create your booking website
              </button>

              <p className="mt-3 text-sm text-gray-500">
                Preview and test your site before purchasing
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================
     CLIENT PRICING PAGE
     (UNCHANGED)
     ======================= */

  const customerConfig = customer as CustomerConfig;
  const pricing = customerConfig.pricing;

  // Extra safety (important)
  if (!pricing || !pricing.rows || pricing.rows.length === 0) {
    return (
      <main className="min-h-screen px-6 py-24 text-center">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="mt-4 text-gray-500">
          Pricing information will be available soon.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            {pricing.title}
          </h1>

          {pricing.subtitle && (
            <p className="mt-3 text-gray-600">
              {pricing.subtitle}
            </p>
          )}
        </div>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full border rounded-xl bg-white shadow-md overflow-hidden">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-4">Service</th>
                <th className="p-4 w-32">Price</th>
                <th className="p-4">Includes</th>
              </tr>
            </thead>

            <tbody>
              {pricing.rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-4 font-medium">
                    {row.name}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {row.price}
                  </td>
                  <td className="p-4 text-gray-600">
                    {row.includes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
