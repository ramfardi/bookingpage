"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

export default function AboutPage() {
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

  /* =====================================================
     SALES ABOUT PAGE
     ===================================================== */
  if (mode === "sales") {
    return (
      <main className="w-full bg-white">
        {/* HERO */}
        <section className="pt-16 pb-10 md:pt-20 md:pb-14 px-6 text-center bg-gradient-to-b from-indigo-50 to-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              About SimpleBookMe
            </h1>

            <p className="mt-6 text-lg text-gray-600">
              A simple, affordable way for independent professionals to accept
              bookings online.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto space-y-16">
            {/* WHAT IT IS */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                What is SimpleBookMe?
              </h2>

              <p className="text-lg text-gray-700 leading-relaxed">
                SimpleBookMe helps small businesses and independent professionals
                create a clean booking website without subscriptions, complex
                tools, or technical setup. You get a single booking link that you
                can share with clients and update anytime.
              </p>
            </div>

            {/* EMAIL BOOKING */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                How email booking works
              </h2>

              <p className="text-lg text-gray-700 leading-relaxed">
                With email-based booking, clients submit a booking request using
                their email. You receive the request instantly, along with the
                service details and preferred time. Both you and your client
                receive a confirmation email, and a calendar (.ics) file can be
                added to your calendar.
              </p>

              <p className="mt-4 text-gray-700">
                This approach keeps things simple, avoids forcing clients to
                create accounts, and works well for businesses that prefer direct
                communication.
              </p>
            </div>

            {/* EXTERNAL BOOKING */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Using an external booking system
              </h2>

              <p className="text-lg text-gray-700 leading-relaxed">
                If you already use a booking platform such as Vagaro, Fresha, or
                another service, you can simply link it to your website. When
                clients click “Book”, they are redirected to your existing
                booking system.
              </p>

              <p className="mt-4 text-gray-700">
                This lets you keep your current workflow while still having a
                professional website and booking link.
              </p>
            </div>

            {/* WHY IT HELPS */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Why SimpleBookMe works for small businesses
              </h2>

              <ul className="space-y-3 text-lg text-gray-700">
                <li>• One-time low cost, no monthly fees</li>
                <li>• Free preview and testing before purchase</li>
                <li>• Your own booking website and unique link</li>
                <li>• Pre-built services based on your business category</li>
                <li>• Edit and update your content anytime</li>
                <li>• No technical knowledge required</li>
              </ul>
            </div>

            {/* SUPPORT */}
            <div className="pt-10 text-center">
              <p className="text-lg text-gray-700 mb-3">
                Need help or have questions? Contact our support team:
              </p>

              <a
                href="mailto:support@simplebookme.com"
                aria-label="Email SimpleBookMe support"
                className="inline-flex justify-center"
              >
                <img
                  src="/images/support-email.svg"
                  alt="Support email"
                  className="h-6"
                />
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SimpleBookMe
        </footer>
      </main>
    );
  }

  /* =====================================================
     CLIENT ABOUT PAGE (UNCHANGED)
     ===================================================== */

  if (mode !== "client") return null;

  const customerConfig = customer as CustomerConfig;
  const { about, heroImage, businessName } = customerConfig;

  return (
    <main className="min-h-screen w-full">
      {/* HERO */}
      <section
        className="relative min-h-[55vh] flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: `url(${heroImage || "/images/hero-default.png"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 px-6 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {about.title}
          </h1>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto space-y-16">
          <p className="text-lg text-gray-700 leading-relaxed">
            {about.description}
          </p>

          {about.highlights?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {about.highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 bg-gray-50 rounded-xl p-5"
                >
                  <span className="text-indigo-600 text-lg">✔</span>
                  <span className="text-gray-800">{item}</span>
                </div>
              ))}
            </div>
          )}

          {about.gallery && about.gallery.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                Sample Work
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {about.gallery.map((img) => (
                  <img
                    key={img}
                    src={img}
                    alt="Sample work"
                    className="rounded-xl object-cover w-full h-56"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {businessName}
      </footer>
    </main>
  );
}
