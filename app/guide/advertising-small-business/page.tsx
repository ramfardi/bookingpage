"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

export default function AdvertisingGuidePage() {
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
            Advertising for Small Businesses
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Advertising is not about being everywhere. It is about being visible
            in the right places to the right people at the right time.
            For solo service businesses — hairdressers, cleaners, nail techs,
            massage therapists, home service providers — advertising must be
            practical, affordable, and focused on local results.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            This guide explains modern digital advertising platforms like
            TikTok, Instagram, Facebook, and Google Ads, as well as traditional
            methods like business cards, partnerships, and referrals.
            We will break down what works, what costs money, what costs time,
            and how to avoid wasting your budget.
          </p>

          {/* Image Placeholder */}
          <div className="mt-12">
            <Image
              src="/images/guide/advertising/advertising-overview.png"
              alt="Small business advertising channels overview"
              width={900}
              height={500}
              className="rounded-2xl border object-cover w-full h-auto"
              priority
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Overview of online and offline advertising channels
            </p>
          </div>

          {/* Strategy Section */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            First: Understand the Goal of Advertising
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Advertising has only one purpose: generating consistent clients.
            Not likes. Not followers. Not vanity metrics.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Before spending money or time, define:
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Who is your ideal client?</li>
            <li>Where do they spend time?</li>
            <li>What problem are you solving?</li>
            <li>What makes you different?</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Advertising works best when the message is clear and specific.
          </p>

          {/* TikTok Section */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Advertising on TikTok
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            TikTok is powerful for service businesses because it allows visual
            storytelling. Before-and-after transformations, cleaning results,
            haircut reveals, or time-lapse work videos perform extremely well.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            Organic TikTok Strategy
          </h3>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Post short 15–30 second transformation videos</li>
            <li>Use trending sounds strategically</li>
            <li>Show personality and behind-the-scenes work</li>
            <li>Post consistently 3–4 times per week</li>
          </ul>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            TikTok Paid Ads
          </h3>

          <p className="mt-6 text-gray-700 leading-relaxed">
            TikTok Ads allow geographic targeting. You can target your city
            and promote a specific offer.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Cost: Often $5–$20 per day minimum. Results depend heavily on video quality.
          </p>

          {/* Instagram */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Advertising on Instagram
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Instagram is ideal for visual service businesses. High-quality
            photos, clean branding, and professional presentation matter.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            Organic Strategy
          </h3>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Post consistent before-and-after photos</li>
            <li>Use local hashtags</li>
            <li>Tag your city in posts</li>
            <li>Engage with local businesses</li>
          </ul>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            Instagram Ads
          </h3>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Instagram ads are run through Meta Ads Manager. You can target by:
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Location</li>
            <li>Age</li>
            <li>Interests</li>
            <li>Behavior</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Budget: $5–$15 per day can test effectiveness locally.
          </p>

          {/* Facebook */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Facebook Advertising & Local Groups
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Facebook remains strong for local service businesses, especially
            in community groups.
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Join local neighborhood groups</li>
            <li>Offer value, not just promotion</li>
            <li>Share testimonials</li>
            <li>Run limited-time offers</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Paid Facebook ads allow precise geographic targeting and retargeting.
          </p>

          {/* Google Ads */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Google Ads (High Intent Advertising)
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Google Ads target people already searching for your service.
            This is high-intent traffic.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Example search terms:
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>"Hair salon near me"</li>
            <li>"House cleaning service in Vancouver"</li>
            <li>"Nail technician downtown"</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Cost per click varies widely, often $1–$5+ depending on competition.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Google Ads can generate clients quickly, but require careful
            keyword selection to avoid wasted spending.
          </p>

          {/* Traditional Methods */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Traditional Advertising Methods
          </h2>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            Business Cards
          </h3>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Business cards still work when distributed intentionally.
            Leave them at complementary businesses.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            Flyers
          </h3>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Flyers can work in specific neighborhoods, especially for
            cleaning and home services.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            Local Partnerships
          </h3>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Partner with:
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Gyms</li>
            <li>Salons</li>
            <li>Real estate agents</li>
            <li>Property managers</li>
          </ul>

          {/* Budget Section */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            How Much Should You Spend?
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            As a beginner, start small:
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Test $150–$300 per month total</li>
            <li>Track bookings carefully</li>
            <li>Measure cost per client</li>
          </ul>

          <p className="mt-6 text-gray-700 leading-relaxed">
            If one channel produces results, scale it slowly.
          </p>

          {/* Mistakes */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Common Advertising Mistakes
          </h2>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Advertising without clear offer</li>
            <li>Not tracking results</li>
            <li>Spending too much too early</li>
            <li>Expecting instant results</li>
          </ul>

          {/* CTA */}
          <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">
            <h3 className="text-2xl font-semibold text-gray-900">
              Turn Advertising Into Real Bookings
            </h3>

            <p className="mt-4 text-gray-600">
              The easier it is for customers to book after seeing your ad,
              the higher your conversion rate. Use an online booking website
              to turn traffic into paying clients.
            </p>

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
        Advertising for Small Businesses
      </h1>
      <p className="mt-4 text-gray-500">
        This guide is only visible on the main website.
      </p>
    </main>
  );
}
