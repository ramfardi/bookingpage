"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<
    CustomerConfig | LandingConfig | null
  >(null);

  const [customerKey, setCustomerKey] = useState<string | null>(null);
  const [mode, setMode] = useState<"sales" | "client">("sales");

  useEffect(() => {
    async function load() {
      const hostname = window.location.hostname;
      const result = await getCustomerConfigFromHost(hostname);

      setCustomer(result.config);
      setMode(result.mode);
      setCustomerKey(result.key);
    }

    load();
  }, []);

  // Prevent hydration mismatch
  if (!customer) {
    return null;
  }

  const landing =
    mode === "sales"
      ? (customer as LandingConfig).landing
      : undefined;

  function handleBookAppointment() {
    if (mode !== "client") {
      router.push("/setup");
      return;
    }

    const customerConfig = customer as CustomerConfig;
    const booking = customerConfig.booking;

    if (booking?.is_external && booking.bookingLink) {
      window.location.href = booking.bookingLink;
      return;
    }

    if (!customerKey) return;
	router.push(`/site/${customerKey}/booking`);
  }

  return (
    <main className="min-h-screen w-full flex flex-col">
      {/* HERO */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: `url(${
            mode === "sales"
              ? (customer as LandingConfig).heroImage
              : "/images/hero-default.png"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl px-6"
        >
          {landing && (
            <>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                {landing.header1}{" "}
                <span className="text-indigo-400">
                  {landing.header2}
                </span>
              </h1>

              <p className="mt-6 text-lg opacity-90">
                {landing.subheader1}
              </p>

              <p className="mt-2 text-base opacity-80">
                {landing.subheader2}
              </p>
            </>
          )}

          <div className="mt-10 flex justify-center">
            {mode === "client" ? (
              <button
                onClick={handleBookAppointment}
                className="rounded-xl bg-white text-black px-8 py-4 font-semibold"
              >
                Book appointment
              </button>
            ) : (
              <button
                onClick={() => router.push("/setup")}
                className="rounded-xl bg-indigo-600 text-white px-8 py-4 font-semibold"
              >
                Create your booking site
              </button>
            )}
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* FEATURES + FOOTER (sales only) */}
      {mode === "sales" && (
        <>
          <section className="w-full bg-gradient-to-b from-white to-indigo-50 py-32">
            <div className="mx-auto max-w-6xl px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900">
                  Everything you need to book smarter
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Launch a professional booking website in minutes — no setup required.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Use External booking if you wish",
                    desc: "You can use external booking systems like Vagaro, Fresha, etc.",
                  },
                  {
                    title: "Email based Native booking",
                    desc: "Native booking system with email confirmation and calendar (.ics).",
                  },
                  {
                    title: "No monthly fee",
                    desc: "Setup once and forget — no recurring fees.",
                  },
                ].map((f) => (
                  <motion.div
                    key={f.title}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="rounded-2xl bg-white p-8 shadow-md border hover:shadow-xl"
                  >
                    <h3 className="text-xl font-semibold text-gray-900">
                      {f.title}
                    </h3>
                    <p className="mt-3 text-gray-600">
                      {f.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <footer className="bg-white border-t py-12 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SimpleBookMe — All rights reserved.
          </footer>
        </>
      )}
    </main>
  );
}
