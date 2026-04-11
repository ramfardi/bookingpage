
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer_cleaning";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
});

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

	const router = useRouter();
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
                The Easiest Way to Launch Your 
                <span className="text-indigo-400">
                   {" "} Cleaning Business
                </span>
              </h1>

              <p className="mt-10 text-2xl opacity-90">
                Get a professional booking website, price esimator, and live scheduling calendar (no tech skills)
              </p>

              <p className="mt-20 text-base opacity-80 font-semibold">
                {landing.subheader2}
              </p>
            </>
          )

		  }

        </motion.div>
		

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>



      {/* ================= SALES ONLY ================= */}
      {mode === "sales" && (
        <>
		
		<section className="w-full">
  <div className="grid grid-cols-1 md:grid-cols-3">

    {/* IMAGE 1 */}
    <div className="w-full h-[400px] md:h-[500px] overflow-hidden">
      <img
        src="/cleaning_landing/image1.png"
        alt="Cleaning service 1"
        className="w-full h-full object-cover object-center"
      />
    </div>

    {/* IMAGE 2 */}
    <div className="w-full h-[400px] md:h-[500px] overflow-hidden">
      <img
        src="/cleaning_landing/image2.png"
        alt="Cleaning service 2"
        className="w-full h-full object-cover object-center"
      />
    </div>

    {/* IMAGE 3 */}
    <div className="w-full h-[200px] md:h-[500px] overflow-hidden">
      <img
        src="/cleaning_landing/image3.png"
        alt="Cleaning service 3"
        className="w-full h-full object-cover object-center"
      />
    </div>

  </div>
</section>
          {/* -------- FEATURES -------- */}
          <section className="w-full bg-gradient-to-b from-white to-indigo-50 py-32">
            <div className="mx-auto max-w-6xl px-8">
              <div className="text-center mb-16">

			<h2
			  onClick={() => router.push("/tools")}
			  className="text-4xl font-bold text-gray-900 cursor-pointer flex items-center justify-center gap-3"
			>
			  {/* FREE badge */}
			  <span className="px-3 py-1 text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-sm">
				FREE
			  </span>

			  {/* Main text */}
			  <span>
				Tools to Help You Grow Your Business
			  </span>

			  {/* Arrow (visual cue it's clickable) */}
			  <span className="text-indigo-500 text-3xl">→</span>
			</h2>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "The Quote Generator",
                    desc: "Stop quoting over phone. Let customers get instant prices based on the room count and square footage.",
					link: "/cleaning-pricing-calculator",
                  },
                  {
                    title: "The Live Availibility Calendar",
                    desc: "A Dynamic link you can text to clients or post on Facebook. Update your weekly hours once; it syncs everywhere",
					link: "/availability",
                  },
                  {
                    title: "Instagram bio link with booking feature",
                    desc: "Turn your Instagram page into a booking machine",
					link: "/instagram_setup",
                  },
                ].map((f) => (
				<motion.div
				  key={f.title}
				  whileHover={{ y: -8, scale: 1.02 }}
				  transition={{ type: "spring", stiffness: 300 }}
				  className="rounded-2xl bg-white p-8 shadow-md border hover:shadow-xl flex flex-col"
				>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {f.title}
                    </h3>
                    <p className="mt-3 text-gray-600">
                      {f.desc}
                    </p>
					<button
					  onClick={() => router.push(f.link)}
					  className="mt-6 mx-auto rounded-xl bg-indigo-600 text-white px-8 py-3 text-lg font-semibold hover:bg-indigo-700 transition"
					>
					  Click here
					</button>
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
<section className="w-full bg-indigo-600 py-24">
  <div className="mx-auto max-w-4xl px-6 text-center text-white">
    
    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
      Ready to create your booking website?
    </h2>

    <p className="mt-6 text-lg md:text-xl opacity-90 leading-relaxed">
      Launch your professional booking site in minutes. Preview and test everything before you purchase, 
      customize it anytime after, and enjoy a simple one-time payment with no monthly fees.
    </p>

    <button
      onClick={() => router.push("/setup")}
      className="mt-10 inline-block rounded-xl bg-white text-indigo-600 px-10 py-4 text-lg font-semibold hover:bg-gray-100 transition"
    >
      Create Your Booking Site
    </button>

    <p className="mt-4 text-sm opacity-80">
      No monthly fees • Preview before purchase • Edit anytime
    </p>

  </div>
</section>

          {/* -------- FAQ -------- */}
          <section className="bg-gray-50 py-28">
            <div className="mx-auto max-w-4xl px-8">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
                FAQs
              </h2>

              <div className="space-y-4">
                {[
  {
    q: "Can my clients get instant cleaning price estimates?",
    a: "Yes. Clients can input details like home size or number of rooms to get an instant price estimate before booking.",
  },
  {
    q: "Can I show different types of cleaning services?",
    a: "Yes. You can list services like standard cleaning, deep cleaning, move-in/move-out cleaning, and more with custom pricing.",
  },
  {
    q: "Can I share my availability with clients easily?",
    a: "Yes. You get a live availability link that you can send to clients or post online, so they can see when you're available.",
  },
  {
    q: "Do clients need to call or message me to book?",
    a: "No. Clients can view your services, see pricing, and request bookings directly through your website without calling.",
  },
  {
    q: "Can I use this for recurring cleaning clients?",
    a: "Yes. You can use it to manage both one-time and recurring cleaning clients by sharing your booking link.",
  },
  {
    q: "Can I add my own pricing and cleaning packages?",
    a: "Yes. You can fully customize your pricing, packages, and service descriptions at any time.",
  },
  {
    q: "Can I use this link on Facebook or local ads?",
    a: "Yes. Your booking link works perfectly for Facebook, Google ads, and local listings to convert visitors into clients.",
  },
  {
    q: "Will this make my cleaning business look more professional?",
    a: "Yes. A dedicated booking website with clear pricing and services helps build trust and makes your business look more professional.",
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
