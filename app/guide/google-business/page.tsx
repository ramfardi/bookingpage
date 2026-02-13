"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

export default function GoogleBusinessGuidePage() {
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
        <div className="w-full max-w-4xl">

          {/* Back Link */}
          <div className="mb-8">
            <Link
              href="/guide"
              className="text-sm text-indigo-600 hover:underline"
            >
              ← Back to Business Guide
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Add Your Business to Google Maps
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Getting your business listed on Google Maps is one of the most important
            steps you can take as a new solo business owner. Whether you are a
            hairdresser, cleaner, massage therapist, nail technician, or any
            other service provider, your customers are searching for services
            near them every day. If you are not visible on Google Maps, you are
            invisible to a large portion of potential clients.
          </p>

			{/* Floating Image */}
			<div className="mt-10">
			  <div className="float-right w-80 ml-8 mb-6">
				<Image
				  src="/images/guide/google/step1.png"
				  alt="Google Business Profile dashboard interface example"
				  width={320}
				  height={224}
				  className="rounded-xl border object-cover w-full h-56"
				  priority
				/>
				<p className="text-xs text-gray-500 mt-2 text-center">
				  Adding your buisiness to Google map
				</p>
			  </div>

            <p className="text-gray-700 leading-relaxed">
              Google Maps listings are managed through a tool called Google
              Business Profile (formerly known as Google My Business). Once
              your profile is verified, your business can appear in Google
              Search results, Google Maps, and even in the local “3-pack”
              listings that appear at the top of search results when users
              search for terms like “hair salon near me” or “cleaning service in
              Vancouver.”
            </p>

            <p className="mt-6 text-gray-700 leading-relaxed">
              This guide will walk you step by step through the entire process,
              from creating your listing to optimizing it properly. If you
              follow each step carefully, your business can start appearing in
              local searches within days after verification.
            </p>
          </div>

          {/* Why It Matters */}
          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Why Adding Your Business to Google Maps Is Essential
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Before we go into the technical steps, it’s important to understand
            why this matters so much. When customers search for services, they
            rarely scroll through dozens of websites. Most people click on one
            of the first few map results they see. If your competitor is listed
            and you are not, they will likely get the call.
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Increases local visibility</li>
            <li>Builds credibility and trust</li>
            <li>Allows customers to leave reviews</li>
            <li>Displays phone number, hours, and directions</li>
            <li>Improves overall SEO rankings</li>
          </ul>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Step-by-Step: How to Add Your Business to Google Maps
          </h2>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Step 1: Create or Sign in to a Google Account
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Go to google.com and sign in using a Gmail account. If you do not
            have one, create a free Google account. This account will manage
            your business profile, reviews, and future updates.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Step 2: Go to Google Business Profile
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Visit business.google.com and click “Manage now.” This starts the
            process of creating your listing.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Step 3: Enter Your Business Name
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Enter your business name exactly as it appears in real life. Avoid
            adding extra keywords like city names or services unless they are
            officially part of your brand.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Step 4: Choose the Correct Category
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Your category determines when your business appears in searches.
            For example: Hair Salon, Cleaning Service, Massage Therapist,
            Nail Salon. Choose the most accurate primary category. You can add
            secondary categories later.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Step 5: Add Your Location or Service Area
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            If customers visit your location, enter your full address. If you
            travel to clients (for example, mobile hairdresser or home cleaner),
            select service areas instead.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Step 6: Add Contact Information
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Enter your phone number and website if available. If you don’t have
            a website yet, you can add one later.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Step 7: Verify Your Business
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Google will require verification. This can be done through postcard,
            phone, email, or video verification depending on your location.
            Verification confirms that your business is legitimate.
          </p>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Optimizing Your Profile for Better Results
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            After verification, do not stop there. Optimization is what makes
            the difference between appearing occasionally and ranking
            consistently.
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Add high-quality photos of your work</li>
            <li>Write a clear and keyword-rich business description</li>
            <li>Set accurate business hours</li>
            <li>Respond to every review</li>
            <li>Post updates regularly</li>
          </ul>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Pros and Cons of Google Maps Listing
          </h2>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            Pros
          </h3>
          <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
            <li>Free marketing tool</li>
            <li>Builds trust instantly</li>
            <li>Generates local leads</li>
            <li>Allows review collection</li>
          </ul>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            Cons
          </h3>
          <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
            <li>Negative reviews are public</li>
            <li>Requires maintenance and updates</li>
            <li>Verification process can take time</li>
          </ul>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            What to Do After Getting Listed
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Once customers find you on Google Maps, the next step is making it
            easy for them to book your services without calling or texting.
            An online booking system reduces missed calls, prevents double
            bookings, and allows you to collect deposits.
          </p>

          {/* CTA */}
          <div className="mt-12 p-8 bg-gray-50 rounded-2xl text-center">
            <h3 className="text-2xl font-semibold text-gray-900">
              Ready to Accept Online Bookings?
            </h3>

            <p className="mt-4 text-gray-600">
              Turn your Google visitors into paying clients with an instant
              booking website.
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

  /* =======================
     CLIENT MODE
     ======================= */
  return (
    <main className="min-h-screen px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">
        Add Your Business to Google Maps
      </h1>
      <p className="mt-4 text-gray-500">
        This guide is only visible on the main website.
      </p>
    </main>
  );
}
