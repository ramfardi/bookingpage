"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

export default function PaymentMethodsGuidePage() {
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

  if (mode === "sales") {
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
            How to Accept Payments (Machines, Online, Fees & Tax)
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Accepting payments correctly is essential for any solo business.
          </p>

          <div className="mt-12">
            <Image
              src="/images/guide/payments/payment-methods-overview.png"
              alt="Overview of payment methods"
              width={900}
              height={500}
              className="rounded-2xl border object-cover w-full h-auto"
              priority
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Example overview of common payment methods
            </p>
          </div>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Popular Card Machines Compared
          </h2>

          <table className="w-full text-left border-collapse mt-4 text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">Provider</th>
                <th className="border px-3 py-2">Device Type</th>
                <th className="border px-3 py-2">Fees*</th>
                <th className="border px-3 py-2">Monthly Cost</th>
                <th className="border px-3 py-2">Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2 font-semibold">Square Reader</td>
                <td className="border px-3 py-2">Mobile Bluetooth</td>
                <td className="border px-3 py-2">~2.6% + $0.10</td>
                <td className="border px-3 py-2">$0</td>
                <td className="border px-3 py-2">New solo owners</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold">Stripe Terminal</td>
                <td className="border px-3 py-2">Countertop/Portable</td>
                <td className="border px-3 py-2">~2.7% + $0.05</td>
                <td className="border px-3 py-2">$0–$59</td>
                <td className="border px-3 py-2">Integrated online + in person</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold">Clover Mini</td>
                <td className="border px-3 py-2">All-in-One</td>
                <td className="border px-3 py-2">~2.3%–3.5%</td>
                <td className="border px-3 py-2">$14+ /mo</td>
                <td className="border px-3 py-2">Multiple staff machines</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-semibold">SumUp Air</td>
                <td className="border px-3 py-2">Mobile Bluetooth</td>
                <td className="border px-3 py-2">~1.69%+</td>
                <td className="border px-3 py-2">$0</td>
                <td className="border px-3 py-2">Lowest fee option</td>
              </tr>
            </tbody>
          </table>

          <p className="mt-6 text-gray-700 leading-relaxed">
            <strong>Square Reader</strong> is easy to start with — no monthly costs.
            <strong> Stripe Terminal</strong> is ideal if you also accept online card payments.
            <strong> Clover</strong> is more robust but more expensive.
            <strong> SumUp</strong> is one of the lowest fee options in many regions.
          </p>

          <h3 className="mt-16 text-xl font-semibold text-gray-900">
            2. Online Payments (Without a Card Machine)
          </h3>

          <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>Payment Links</strong> — Send a link via email/text
            </li>
            <li>
              <strong>Online Invoices</strong> — Send invoice with pay button
            </li>
            <li>
              <strong>Website Checkout</strong> — Pay directly on your site
            </li>
          </ul>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Common Online Providers
          </h3>

          <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-3">
            <li>
              <strong>Stripe Payments</strong> — Secure, integrates well
            </li>
            <li>
              <strong>PayPal Business</strong> — Trusted worldwide
            </li>
            <li>
              <strong>Square Online Checkout</strong> — Simple links
            </li>
            <li>
              <strong>Google Pay / Apple Pay</strong> — Fast wallet payments
            </li>
          </ul>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Tax Implications & Bookkeeping
          </h2>

          <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>Record Total Sales</strong> — Before fees
            </li>
            <li>
              <strong>Record Fees Separately</strong> — As expenses
            </li>
            <li>
              <strong>Report Tax on Full Amount</strong>
            </li>
          </ul>

          <div className="mt-14 p-8 bg-gray-50 rounded-2xl text-center">
            <h3 className="text-2xl font-semibold text-gray-900">
              Ready to Accept Online Bookings and Payments?
            </h3>

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

  return (
    <main className="min-h-screen px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">
        How to Accept Payments (Machines, Online, Fees & Tax)
      </h1>
      <p className="mt-4 text-gray-500">
        This guide is only visible on the main website.
      </p>
    </main>
  );
}
