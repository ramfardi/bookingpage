"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/site/${siteId}`);
      const data = await res.json();

      setEmail(data.email?.bookingNotifications || null);
      setSubdomain(data.subdomain || "yourbusiness");
    }

    load();
  }, [siteId]);

  async function handleCheckout() {
    if (!email || !email.includes("@")) {
      alert("Please add a valid email in your site settings first.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, email }),
    });

    if (!res.ok) {
      alert("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Secure your domain</h1>

        <p className="text-gray-600 mb-4">
          Activate your booking website and make it live.
        </p>

        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">
            Your website will be live at
          </p>
          <p className="font-semibold text-indigo-600">
            {subdomain}.simplebookme.com
          </p>
        </div>

        <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
          <li>✔ Accept bookings from real clients</li>
          <li>✔ Edit services & pricing anytime</li>
          <li>✔ Upload photos and showcase your work</li>
          <li>✔ Use built-in or external booking systems</li>
          <li>✔ Receive booking emails automatically</li>
        </ul>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          {loading ? "Redirecting…" : "Pay & go live"}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Secure payment powered by Stripe
        </p>
      </div>
    </main>
  );
}
