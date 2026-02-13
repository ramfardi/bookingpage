"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

export default function BusinessEmailGuidePage() {
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
            Create a Professional Business Email
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            A professional business email is one of the simplest yet most
            powerful tools you can set up as a solo business owner. Whether
            you are a hairdresser, cleaner, nail technician, massage therapist,
            or any other service provider, your email address directly affects
            how customers perceive your professionalism.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed">
            An address like <strong>yourname@gmail.com</strong> works, but it
            does not build brand authority. A custom address such as{" "}
            <strong>info@yourbusiness.com</strong> instantly increases trust.
            It shows that your business is legitimate, organized, and serious.
          </p>

          {/* Large Image Section */}
          <div className="mt-12">
            <Image
              src="/images/guide/email/workspace-dashboard.png"
              alt="Google Workspace email setup dashboard example"
              width={900}
              height={500}
              className="rounded-2xl border object-cover w-full h-auto"
              priority
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Example of Google Workspace email setup dashboard
            </p>
          </div>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Why a Business Email Matters
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Customers make decisions in seconds. When they receive an email
            from a custom domain, they subconsciously associate your business
            with stability and reliability. This small detail can increase
            response rates and conversion rates.
          </p>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Builds credibility and trust</li>
            <li>Reinforces your brand name</li>
            <li>Required for many payment providers</li>
            <li>Improves communication consistency</li>
            <li>Looks professional on invoices and booking confirmations</li>
          </ul>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Step-by-Step: How to Create a Business Email
          </h2>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Step 1: Purchase a Domain Name
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            A domain name is your website address (for example,
            yourbusiness.com). You can purchase domains from providers like
            Namecheap, GoDaddy, or Google Domains. Choose a domain that
            matches your business name as closely as possible.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Step 2: Choose an Email Hosting Provider
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            The most popular option is Google Workspace. It allows you to use
            Gmail with your custom domain. Other options include Microsoft 365
            or Zoho Mail.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Step 3: Verify Domain Ownership
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            After signing up, your email provider will ask you to verify your
            domain. This involves adding a DNS record to your domain provider’s
            settings. It may sound technical, but most providers offer clear
            instructions.
          </p>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Step 4: Create Your Email Address
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Common formats include:
          </p>

          <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
            <li>info@yourbusiness.com</li>
            <li>bookings@yourbusiness.com</li>
            <li>support@yourbusiness.com</li>
            <li>yourname@yourbusiness.com</li>
          </ul>

          <h3 className="mt-10 text-xl font-semibold text-gray-900">
            Step 5: Configure SPF, DKIM, and DMARC
          </h3>
          <p className="mt-4 text-gray-700 leading-relaxed">
            These are security records that improve email deliverability and
            prevent your emails from being marked as spam. Most email providers
            guide you through this automatically.
          </p>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Costs to Expect
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Domains typically cost $10–20 per year. Google Workspace plans
            usually start around $6–12 per user per month. For a solo business,
            this is a small investment for a major boost in professionalism.
          </p>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Pros and Cons of Business Email
          </h2>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            Pros
          </h3>
          <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
            <li>Professional appearance</li>
            <li>Improves brand identity</li>
            <li>Better email deliverability</li>
            <li>Scalable as your business grows</li>
          </ul>

          <h3 className="mt-8 text-lg font-semibold text-gray-900">
            Cons
          </h3>
          <ul className="mt-4 list-disc pl-6 text-gray-700 space-y-2">
            <li>Monthly cost</li>
            <li>Requires basic setup process</li>
            <li>Needs occasional maintenance</li>
          </ul>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Best Practices for Using Your Business Email
          </h2>

          <ul className="mt-6 list-disc pl-6 text-gray-700 space-y-3">
            <li>Use a professional email signature</li>
            <li>Respond to customer inquiries promptly</li>
            <li>Use folders and labels to stay organized</li>
            <li>Connect email to your booking confirmations</li>
          </ul>

          <h2 className="mt-16 text-2xl font-semibold text-gray-900">
            Connecting Email to Your Booking System
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Once your email is set up, you can connect it to your booking
            website to send automatic confirmations, reminders, and receipts.
            This eliminates manual follow-ups and improves customer experience.
          </p>

          {/* CTA */}
          <div className="mt-14 p-8 bg-gray-50 rounded-2xl text-center">
            <h3 className="text-2xl font-semibold text-gray-900">
              Ready to Set Up Your Booking Website?
            </h3>

            <p className="mt-4 text-gray-600">
              Use your professional email together with an online booking
              system to automate appointments and reduce missed calls.
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
        Create a Professional Business Email
      </h1>
      <p className="mt-4 text-gray-500">
        This guide is only visible on the main website.
      </p>
    </main>
  );
}
