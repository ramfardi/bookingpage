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

          {/* INTRODUCTION */}
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Accepting payments correctly is one of the most important decisions
            you will make as a solo business owner. Whether you are a hairdresser,
            cleaner, nail technician, massage therapist, or home service provider,
            how you collect money affects your professionalism, cash flow,
            tax reporting, and overall profitability.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Today’s customers expect flexibility. Some want to tap a card,
            some prefer Apple Pay or Google Pay, and others may want to pay
            online before the appointment. If your payment system is difficult
            or outdated, customers may hesitate to book.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            In this guide, you will learn:
          </p>

          <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
            <li>How in-person card machines work</li>
            <li>How online payment systems compare</li>
            <li>What common providers charge</li>
            <li>How fees impact your pricing</li>
            <li>How to handle taxes and bookkeeping correctly</li>
          </ul>

          {/* IMAGE */}
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

          {/* WHY PAYMENTS MATTER */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Why Your Payment Setup Matters
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Your payment system affects three key areas:
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Speed of receiving money</li>
            <li>Customer trust and professionalism</li>
            <li>Long-term profit margins</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Even a small difference in transaction fees can add up significantly
            over hundreds or thousands of payments per year.
          </p>

          {/* CARD MACHINES */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Popular Card Machines Compared
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Card machines allow you to accept in-person debit and credit card
            payments. Most modern machines connect via Bluetooth or WiFi and
            deposit funds into your bank account within 1–2 business days.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Below is a simplified comparison of common providers. Fees vary
            by country and card type, so always check the official pricing.
          </p>

          <table className="w-full text-left border-collapse mt-6 text-sm text-gray-700">
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
            <strong>Square Reader</strong> is popular for beginners because
            there is no monthly fee and setup is simple.
            <strong> Stripe Terminal</strong> is ideal if you want one system
            for both in-person and online payments.
            <strong> Clover</strong> offers more advanced point-of-sale features
            but usually includes subscription costs.
            <strong> SumUp</strong> is often attractive for its lower percentage fees.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            When choosing a machine, consider:
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-2">
            <li>Do you need mobility?</li>
            <li>Do you need inventory tracking?</li>
            <li>Do you need staff login accounts?</li>
            <li>Will you also accept online bookings?</li>
          </ul>

          {/* ONLINE PAYMENTS */}
          <h3 className="mt-16 text-xl font-semibold text-gray-900">
            2. Online Payments (Without a Card Machine)
          </h3>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Online payments are critical if customers book online or if you
            want deposits before appointments. These systems allow customers
            to pay using secure web pages.
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li><strong>Payment Links</strong> — Send a link via email or text</li>
            <li><strong>Online Invoices</strong> — Send invoice with pay button</li>
            <li><strong>Website Checkout</strong> — Pay directly on your site</li>
          </ul>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Common Online Providers
          </h3>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li><strong>Stripe Payments</strong> — Secure, integrates well</li>
            <li><strong>PayPal Business</strong> — Trusted worldwide</li>
            <li><strong>Square Online Checkout</strong> — Simple links</li>
            <li><strong>Google Pay / Apple Pay</strong> — Fast wallet payments</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Online fees are typically similar to card machine fees because
            both go through credit card networks.
          </p>

          {/* TAX */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Tax Implications & Bookkeeping
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            One of the most common mistakes small business owners make is
            misunderstanding how to record payment fees.
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Record Total Sales</strong> — Before fees</li>
            <li><strong>Record Fees Separately</strong> — As expenses</li>
            <li><strong>Report Tax on Full Amount</strong></li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Example: If a client pays $100 and the processor takes $2.60,
            your books should show $100 revenue and $2.60 expense.
          </p>

          {/* CTA */}
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
