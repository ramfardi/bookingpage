"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

type UnifiedPricingItem = {
  label: string;
  description?: string;
  price?: string;
};

export default function PricingPage() {
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

  // Pricing page is CLIENT-ONLY
  if (mode !== "client") return null;

  const customerConfig = customer as CustomerConfig;
  const pricing = customerConfig.pricing;

  // 🔁 BACKWARD-COMPATIBLE NORMALIZATION
	const pricingItems =
	  pricing?.items?.length
		? pricing.items
		: pricing?.rows?.length
		? pricing.rows.map((row) => ({
			label: row.name,
			description: row.includes,
			price: row.price,
		  }))
		: customerConfig.services?.length
		? customerConfig.services.map((service) => ({
			label: service,
			description: "",
			price: "",
		  }))
		: [];


  // Extra safety
  if (!pricing || pricingItems.length === 0) {
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
              {pricingItems.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-4 font-medium">
                    {item.label}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {item.price || "—"}
                  </td>
                  <td className="p-4 text-gray-600">
                    {item.description || "—"}
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
