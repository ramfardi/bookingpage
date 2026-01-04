"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig, LandingConfig } from "@/app/lib/customerConfig";



export default function AboutPage() {
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
  setMode(result.mode); // 👈 THIS WAS MISSING
}, []);



  if (!customer) return null;

	  if (mode !== "client") {
	  return null; // or render sales/about copy
	}

	const { about } = customer as CustomerConfig;


  return (
    <main className="min-h-screen w-full">

      {/* HERO (reuse landing image) */}
      <section
        className="relative min-h-[55vh] flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: `url(${customer.heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 px-6 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {about.title}
          </h1>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">

          {/* Description */}
          <p className="text-lg text-gray-700 leading-relaxed">
            {about.description}
          </p>

          {/* Highlights */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          {/* CTA */}
          <div className="mt-16 text-center">

          </div>
        </div>
      </section>

      {/* FOOTER */}
	<footer className="border-t py-8 text-center text-sm text-gray-500">
	  © {new Date().getFullYear()}{" "}
	  {mode === "client"
		? (customer as CustomerConfig).businessName
		: "Your Company"}
	</footer>

    </main>
  );
}
