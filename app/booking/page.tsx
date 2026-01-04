"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import { CustomerConfig, LandingConfig } from "@/app/lib/customerConfig";
const [mode, setMode] = useState<"sales" | "client">("sales");


export default function BookingPage() {
	const [customer, setCustomer] = useState<
	  CustomerConfig | LandingConfig | null
	>(null);

  const [customerKey, setCustomerKey] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

	useEffect(() => {
	  const result = getCustomerConfigFromHost(window.location.hostname);
	  setCustomer(result.config);
	  setMode(result.mode);
	}, []);


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!customer || !customerKey) return;

    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      customerKey,
      service: formData.get("service"),
      preferred_date: formData.get("preferred_date"),
      preferred_time: formData.get("preferred_time"),
      customer_email: formData.get("email"),
      company: formData.get("company"), // honeypot
    };

    try {
      const res = await fetch("/api/send-booking-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Booking failed");
      }

	if (
	  mode === "client" &&
	  (customer as CustomerConfig).deposit?.enabled &&
	  (customer as CustomerConfig).deposit?.stripePaymentLink
	) {
	  window.location.href = (customer as CustomerConfig).deposit.stripePaymentLink;
	} else {
	  setSubmitted(true);
	}

    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!customer) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
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
          Request an appointment with {customer.businessName}
        </p>

        {customer.deposit?.enabled && (
          <p className="mt-4 text-center text-sm text-indigo-600 font-medium">
            {customer.deposit.amountLabel}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">

          {/* Honeypot (spam trap) */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
          />

          <select name="service" required className="w-full border rounded-xl p-3">
            <option value="">Select service</option>
            {customer.services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>

          <input type="date" name="preferred_date" required className="w-full border rounded-xl p-3" />
          <input type="time" name="preferred_time" required className="w-full border rounded-xl p-3" />

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
