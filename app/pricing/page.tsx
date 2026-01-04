"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import { CustomerConfig } from "@/app/lib/customerConfig";
import { LandingConfig } from "@/app/lib/customerConfig";


export default function PricingPage() {
const [customer, setCustomer] = useState<
  CustomerConfig | LandingConfig | null
>(null);

const [customerKey, setCustomerKey] = useState<string | null>(null);

useEffect(() => {
  const hostname = window.location.hostname;
  const result = getCustomerConfigFromHost(hostname);

  setCustomer(result.config);
  setCustomerKey(result.key);
}, []);


  if (!customer) return null;

  const { pricing } = customer;

  return (
    <main className="min-h-screen px-6 py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold">{pricing.title}</h1>
        <p className="mt-3 text-gray-600">{pricing.subtitle}</p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {pricing.plans.map((plan) => (
            <div
              key={plan.name}
              className="bg-white rounded-2xl shadow-md p-8 text-left"
            >
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-3xl font-bold mt-2">{plan.price}</p>
              <p className="mt-2 text-gray-600">{plan.description}</p>

              <ul className="mt-4 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
