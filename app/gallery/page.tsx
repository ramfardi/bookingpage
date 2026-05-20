"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

function normalizeGoogleDriveImage(url: string) {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);

  if (fileMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  }

  const openMatch = url.match(/[?&]id=([^&]+)/);

  if (url.includes("drive.google.com") && openMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${openMatch[1]}`;
  }

  return url;
}

export default function GalleryPage() {
  const [customer, setCustomer] = useState<
    CustomerConfig | LandingConfig | null
  >(null);

  const [mode, setMode] = useState<"sales" | "client">("sales");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
  if (mode !== "client") return null;

  const customerConfig = customer as CustomerConfig;
  const gallery = customerConfig.about?.gallery || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Samples
          </h1>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Explore examples of our recent work and projects.
          </p>
        </div>

        {gallery.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-lg">
              Gallery images will be added soon.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {gallery.map((url, index) => {
              const imageUrl = normalizeGoogleDriveImage(url);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(imageUrl)}
                  className="group break-inside-avoid w-full text-left"
                >
                  <div className="relative overflow-hidden rounded-[2rem] bg-white p-2 shadow-xl ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <div className="overflow-hidden rounded-[1.5rem]">
                      <img
                        src={imageUrl}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    <div className="pointer-events-none absolute inset-2 rounded-[1.5rem] bg-gradient-to-t from-black/25 via-transparent to-white/10 opacity-0 transition duration-300 group-hover:opacity-100" />

                    <div className="pointer-events-none absolute bottom-5 left-5 right-5 opacity-0 transition duration-300 group-hover:opacity-100">
                      <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="absolute top-5 right-5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow"
            onClick={() => setSelectedImage(null)}
          >
            Close
          </button>

          <img
            src={selectedImage}
            alt="Enlarged gallery image"
            className="max-h-[85vh] max-w-[95vw] rounded-3xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}