"use client";

import { Poppins } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function ToolsPage() {
  const router = useRouter();

  const tools = [
    {
      title: "QR Code Generator",
      link: "/qr-code-generator",
      description:
        "Create high-resolution QR codes for your website, booking page, business card, or marketing materials. Download printable PNG or scalable SVG files and optionally add your logo and branding."
    },
    {
      title: "Service Price Calculator",
      link: "/service-price-calculator",
      description:
        "Calculate profitable service pricing based on hourly cost, expenses, and desired profit margin. Ideal for freelancers and service businesses that want to avoid underpricing."
    },
    {
      title: "Advertising Budget Calculator",
      link: "/advertising-budget-calculator",
      description:
        "Estimate how much you should spend on advertising based on your service price and profit margin. Helps small businesses plan marketing budgets without risking profitability."
    }
  ];

  return (
    <main
      className={`${poppins.className} min-h-screen bg-white px-6 py-24 flex justify-center`}
    >
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Free Business Tools",
            "description":
              "Free tools for small businesses including QR code generator, service price calculator, and advertising budget calculator.",
            "url": "https://simplebookme.com/tools"
          }),
        }}
      />

      <div className="w-full max-w-5xl">

        {/* Back */}
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
          Free Tools for Small Businesses
        </h1>

        <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-3xl">
          Practical tools designed to help small service businesses launch,
          grow, and operate more efficiently. From generating QR codes to
          calculating pricing and advertising budgets, these tools help you
          make smarter business decisions.
        </p>

        {/* Tools Grid */}
        <div className="mt-14 grid md:grid-cols-2 gap-8">

          {tools.map((tool, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl p-8 bg-white hover:shadow-md transition"
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                {tool.title}
              </h2>

              <p className="mt-4 text-gray-600 leading-relaxed">
                {tool.description}
              </p>

              <button
                onClick={() => router.push(tool.link)}
                className="mt-6 rounded-xl bg-indigo-600 text-white px-6 py-3 font-semibold hover:bg-indigo-700 transition"
              >
                Open Tool
              </button>
            </div>
          ))}

        </div>

        {/* Extra SEO Content */}
        <div className="mt-20 space-y-6 text-gray-700 leading-relaxed">

          <h2 className="text-2xl font-semibold text-gray-900">
            Why Free Business Tools Matter
          </h2>

          <p>
            Many small business owners struggle with pricing services,
            marketing budgets, and customer acquisition strategies. Simple
            tools can remove guesswork and help entrepreneurs make informed
            decisions that improve profitability and growth.
          </p>

          <p>
            Our tools are designed specifically for service businesses such as
            salons, cleaners, freelancers, consultants, coaches, and local
            professionals who want simple solutions without complex software.
          </p>

          <p>
            These tools can also integrate naturally with your business website
            or booking page so customers can discover your services, scan QR
            codes, and schedule appointments easily.
          </p>

        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl text-center">

          <h3 className="text-2xl font-semibold text-gray-900">
            Ready to Accept Online Bookings?
          </h3>

          <p className="mt-4 text-gray-600">
            Create a professional booking website where customers can view
            your services, check prices, and book appointments instantly.
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