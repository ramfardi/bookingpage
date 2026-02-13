"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

type GuideItem = {
  title: string;
  description: string;
  href: string;
};

const guideItems: GuideItem[] = [
  {
    title: "Add Your Business to Google Maps",
    description:
      "Step-by-step guide to getting listed on Google Search and Maps so local customers can find you easily.",
    href: "/guide/google-business",
  },
  {
    title: "Create a Professional Business Email",
    description:
      "Learn how to set up a custom email like info@yourbusiness.com to increase trust and professionalism.",
    href: "/guide/business-email",
  },
  {
    title: "How to Set Your Prices Properly",
    description:
      "Avoid underpricing your services. Learn how to calculate profit and set sustainable pricing.",
    href: "/guide/pricing-guide",
  },
  {
    title: "How to Accept Payments (Card Machines & Fees)",
    description:
      "Understand Square, Stripe, transaction fees, deposits, and how to charge customers correctly.",
    href: "/guide/payment-methods",
  },
  {
    title: "How to Get Your First 20 Clients",
    description:
      "Simple marketing strategies for solo business owners to attract their first paying customers.",
    href: "/guide/getting-first-clients",
  },
  
  {
  title: "Advertising for Small Businesses",
  description:
    "Practical advertising strategies for small service businesses. Learn how to use Google Ads, social media, local partnerships, and low-budget marketing methods to attract consistent clients without wasting money.",
  href: "/guide/advertising-small-business",
},

];

export default function BusinessGuidePage() {
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

  /* =======================
     SALES MODE
     ======================= */
  if (mode === "sales") {
    return (
      <main className="min-h-screen bg-white px-6 py-24 flex justify-center">
        <div className="w-full max-w-6xl">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Small Business Setup Guide
            </h1>

            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Step-by-step resources to help you launch, manage, and grow your
              solo business professionally.
            </p>
          </div>

          {/* Guide Cards */}
          <section className="mt-20 grid md:grid-cols-2 gap-8">
            {guideItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition hover:border-indigo-300"
              >
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                  {item.title}
                </h2>

                <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-6 text-indigo-600 font-medium text-sm">
                  Read full guide →
                </div>
              </Link>
            ))}
          </section>

          {/* CTA Section */}
          <section className="mt-28 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to Accept Online Bookings?
            </h2>

            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Once your business is set up, let customers book instantly —
              without phone calls or manual scheduling.
            </p>

            <div className="mt-8">
              <button
                onClick={() => router.push("/setup")}
                className="rounded-xl bg-indigo-600 text-white px-10 py-4 font-semibold hover:bg-indigo-700 transition"
              >
                Create Your Booking Website
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /* =======================
     CLIENT MODE
     ======================= */
  return (
    <main className="min-h-screen px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">Business Guide</h1>
      <p className="mt-4 text-gray-500">
        This guide is only visible on the main website.
      </p>
    </main>
  );
}
