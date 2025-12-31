"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import { CustomerConfig } from "@/app/lib/customerConfig";

export default function BookingPage() {
  const [customer, setCustomer] = useState<CustomerConfig | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Load customer config from subdomain
  useEffect(() => {
    const hostname = window.location.hostname;
    const config = getCustomerConfigFromHost(hostname);
    setCustomer(config);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // ✅ REQUIRED: guard for TS + runtime safety
    if (!customer) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    fetch(customer.bookingEmailForm, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })
      .then(() => {
        // 🔹 Redirect to Stripe if deposit is enabled
        if (customer.deposit?.enabled && customer.deposit.stripePaymentLink) {
          window.location.href = customer.deposit.stripePaymentLink;
        } else {
          setSubmitted(true);
        }
      })
      .catch(() => {
        alert("Something went wrong. Please try again.");
      });
  }

  // Loading state
  if (!customer) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  // Success state (no deposit)
  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold">Request sent</h1>
          <p className="mt-3 text-gray-600">
            We’ll confirm your appointment by email shortly.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-xl w-full">

        <h1 className="text-3xl font-bold text-center">
          Book an appointment
        </h1>

        <p className="mt-3 text-center text-gray-600">
          Request an appointment with {customer.businessName}
        </p>

        {/* Deposit notice (optional per client) */}
        {customer.deposit?.enabled && (
          <p className="mt-4 text-center text-sm text-indigo-600 font-medium">
            {customer.deposit.amountLabel}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">

          {/* Service dropdown (CUSTOM PER CLIENT) */}
          <select
            name="service"
            required
            className="w-full border rounded-xl p-3"
          >
            <option value="">Select service</option>
            {customer.services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>

          {/* Date */}
          <input
            type="date"
            name="preferred_date"
            required
            className="w-full border rounded-xl p-3"
          />

          {/* Time */}
          <input
            type="time"
            name="preferred_time"
            required
            className="w-full border rounded-xl p-3"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            required
            placeholder="Your email"
            className="w-full border rounded-xl p-3"
          />

          {/* Hidden context */}
          <input
            type="hidden"
            name="business"
            value={customer.businessName}
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Request appointment
          </button>

          <p className="text-sm text-center text-gray-500 mt-2">
            You’ll receive confirmation by email.
          </p>
        </form>
      </div>
    </main>
  );
}
