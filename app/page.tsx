"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import { CustomerConfig } from "@/app/lib/customerConfig";
import { LandingConfig } from "@/app/lib/customerConfig";

import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

const [customer, setCustomer] = useState<
  CustomerConfig | LandingConfig | null
>(null);
const [customerKey, setCustomerKey] = useState<string | null>(null);
const [mode, setMode] = useState<"sales" | "client">("sales");

useEffect(() => {
  const hostname = window.location.hostname;
  const result = getCustomerConfigFromHost(hostname);

  setCustomer(result.config);
  setCustomerKey(result.key);
  setMode(result.mode);
}, []);


  // ⛔ Prevent hydration mismatch
  if (!customer) {
    return null; // or a loader
  }

  const { landing } = customer;
  
function handleBookAppointment() {
  if (!customer) return;

  const booking = customer.booking;

  if (booking?.is_external && booking.bookingLink) {
    window.location.href = booking.bookingLink;
    return;
  }

  // Default → internal booking page
  router.push("/booking");
}


  return (
    <main className="min-h-screen w-full flex flex-col">

      {/* HERO */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: `url(${customer.heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl px-6"
        >
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
      </section>
    </main>
  );
}
