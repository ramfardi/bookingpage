"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

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
  if (!customer) {
    return null;
  }

  // Pricing page is CLIENT-ONLY
  if (mode !== "client") {
    return null; // or router.push("/")
  }

  // Safe narrowing
  const customerConfig = customer as CustomerConfig;
  const { pricing } = customerConfig;

  return (
    <main className="min-h-screen px-6 py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold">
          {pricing.title}
        </h1>

        {pricing.subtitle && (
          <p className="mt-3 text-gray-600">
            {pricing.subtitle}
          </p>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {pricing.plans.map((plan) => (
            <div
              key={plan.name}
              className="bg-white rounded-2xl shadow-md p-8 text-left"
            >
              <h3 className="text-xl font-semibold">
                {plan.name}
              </h3>

              <p className="text-3xl font-bold mt-2">
                {plan.price}
              </p>

              {plan.description && (
                <p className="mt-2 text-gray-600">
                  {plan.description}
                </p>
              )}

              <ul className="mt-4 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    • {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
