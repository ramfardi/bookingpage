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

  if (!customer || mode !== "client") return null;

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
          {/* DESCRIPTION */}
          <p className="text-lg text-gray-700 leading-relaxed">
            {about.description}
          </p>

          {/* HIGHLIGHTS */}
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

          {/* SAMPLE WORK / GALLERY */}
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

      {/* FOOTER */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {businessName}
      </footer>
    </main>
  );
}
