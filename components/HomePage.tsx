"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";
import { useRouter } from "next/navigation";

export default function HomePage({
  activeCustomer,
}: {
  activeCustomer?: CustomerConfig;
}) {
  const router = useRouter();

  const [customer, setCustomer] = useState<
    CustomerConfig | LandingConfig | null
  >(null);

  const [customerKey, setCustomerKey] = useState<string | null>(null);
  const [mode, setMode] = useState<"sales" | "client">("sales");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (activeCustomer) {
      setCustomer(activeCustomer);
      setMode("client");
    }
  }, [activeCustomer]);

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

  if (!customer) return null;

  const landing = customer.landing;

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
      {/* ================= HERO ================= */}
      <section
        className="relative min-h-[90vh] pt-20 flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: `url(${
            mode === "sales"
              ? (customer as LandingConfig).heroImage
              : (customer as CustomerConfig).heroImage
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
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

              <p className="mt-2 text-base opacity-80 font-semibold">
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

      {/* ================= SALES ONLY ================= */}
      {mode === "sales" && (
        <>
          {/* -------- FEATURES -------- */}
          <section className="w-full bg-gradient-to-b from-white to-indigo-50 py-32">
            <div className="mx-auto max-w-6xl px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900">
                  Everything you need to book smarter
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Launch a professional booking website in seconds — no setup required.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Use your existing booking system",
                    desc: "Connect Vagaro, Fresha, or any booking system you already use.",
                  },
                  {
                    title: "Built-in email booking",
                    desc: "Clients book via email with automatic confirmation and calendar invites (.ics).",
                  },
                  {
                    title: "One-time setup. No monthly fees.",
                    desc: "Pay once and keep using it — no subscriptions.",
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

			{/*
			<section className="bg-white py-28">
			  <div className="mx-auto max-w-5xl px-8 text-center">
				<h2 className="text-3xl font-bold text-gray-900">
				  How to use SimpleBookMe
				</h2>
				<p className="mt-4 text-lg text-gray-600">
				  A quick walkthrough showing how to create your site and accept bookings.
				</p>

				<div className="mt-12 aspect-video rounded-2xl bg-gray-100 border flex items-center justify-center text-gray-400 text-sm">
				  Demo video coming soon

				  <iframe
					className="absolute inset-0 w-full h-full"
					src="https://www.youtube.com/embed/VIDEO_ID"
					title="How to use SimpleBookMe"
					frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				  />
				</div>
			  </div>
			</section>
			*/}


          {/* -------- FAQ -------- */}
          <section className="bg-gray-50 py-28">
            <div className="mx-auto max-w-4xl px-8">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
                Frequently asked questions
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: "Do I need to pay monthly?",
                    a: "No. SimpleBookMe does not charge any recurring monthly fees.",
                  },
				  {
					  q: "Can I preview and test my website before purchasing?",
					  a: "Yes. You can preview your custom website, test the booking flow, and make changes before completing your purchase.",
					},
                  {
                    q: "Can I use my existing booking system?",
                    a: "Yes. You can link any external booking system or use the built-in email booking.",
                  },
                  {
                    q: "Do my clients need to create an account?",
                    a: "No. Clients book using email only.",
                  },
				  {
					  q: "Can I customize my website later?",
					  a: "Yes. You can edit your website content, services, pricing, and booking options at any time.",
					},
					{
					  q: "Do I get my own booking website link?",
					  a: "Yes. You get a unique booking website link that you can share with your clients.",
					},
					{
				  q: "Can I use pre-built services based on my category?",
				  a: "Yes. You can start with pre-built services based on your business category and customize them anytime.",
				},

                ].map((item, i) => (
                  <div
                    key={item.q}
                    className="rounded-xl bg-white border"
                  >
                    <button
                      onClick={() =>
                        setOpenFaq(openFaq === i ? null : i)
                      }
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="font-semibold text-gray-900">
                        {item.q}
                      </span>
                      <span className="text-2xl font-light">
                        {openFaq === i ? "−" : "+"}
                      </span>
                    </button>

                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6 text-gray-600"
                        >
                          {item.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* -------- FOOTER -------- */}
          <footer className="bg-white border-t py-12 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SimpleBookMe — All rights reserved.
          </footer>
        </>
      )}
    </main>
  );
}
