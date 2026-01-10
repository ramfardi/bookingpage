"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

type BookingService = {
  label: string;
};

export default function BookingPage() {
  const [customer, setCustomer] = useState<
    CustomerConfig | LandingConfig | null
  >(null);

  const [mode, setMode] = useState<"sales" | "client">("sales");
  const [customerKey, setCustomerKey] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const hostname = window.location.hostname;
      const result = await getCustomerConfigFromHost(hostname);

      setCustomer(result.config);
      setMode(result.mode);
      setCustomerKey(result.key);
    }

    load();
  }, []);

  if (!customer) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  if (mode !== "client") return null;

  const customerConfig = customer as CustomerConfig;

  // 🔁 NORMALIZE SERVICES FOR BOOKING DROPDOWN
  const bookingServices: BookingService[] =
    customerConfig.pricing?.items?.length
      ? customerConfig.pricing.items.map((item) => ({
          label: item.label,
        }))
      : customerConfig.pricing?.rows?.length
      ? customerConfig.pricing.rows.map((row: any) => ({
          label: row.name,
        }))
      : customerConfig.services?.length
      ? customerConfig.services.map((service) => ({
          label: service,
        }))
      : [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!customerKey) return;

    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      customerKey,
      service: formData.get("service"),
      preferred_date: formData.get("preferred_date"),
      preferred_time: formData.get("preferred_time"),
      customer_email: formData.get("email"),
      company: formData.get("company"),
    };

    try {
      const res = await fetch("/api/send-booking-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Booking failed");

      const deposit = customerConfig.deposit;

      if (deposit?.enabled && deposit.stripePaymentLink) {
        window.location.href = deposit.stripePaymentLink;
        return;
      }

      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold">Request sent</h1>
          <p className="mt-3 text-gray-600">
            Check your email for confirmation and calendar invite.
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
          Request an appointment with {customerConfig.businessName}
        </p>

        {customerConfig.deposit?.enabled && (
          <p className="mt-4 text-center text-sm text-indigo-600 font-medium">
            {customerConfig.deposit.amountLabel}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
          />

          <select
            name="service"
            required
            className="w-full border rounded-xl p-3"
          >
            <option value="">Select service</option>

            {bookingServices.map((service) => (
              <option key={service.label} value={service.label}>
                {service.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="preferred_date"
            required
            className="w-full border rounded-xl p-3"
          />

          <input
            type="time"
            name="preferred_time"
            required
            className="w-full border rounded-xl p-3"
          />

          <input
            type="email"
            name="email"
            required
            placeholder="Your email"
            className="w-full border rounded-xl p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Request appointment"}
          </button>
        </form>
      </div>
    </main>
  );
}
