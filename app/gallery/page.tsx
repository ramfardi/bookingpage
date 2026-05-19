"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import type { LandingConfig } from "@/app/lib/landingConfig";

function normalizeGoogleDriveImage(url: string) {
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);

  if (fileMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  }

  // Format: https://drive.google.com/open?id=FILE_ID
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

  useEffect(() => {
    async function load() {
      const hostname = window.location.hostname;

      const result = await getCustomerConfigFromHost(hostname);

      setCustomer(result.config);
      setMode(result.mode);
    }

    load();
  }, []);

  // Prevent hydration mismatch
  if (!customer) return null;

  // Gallery is client-only
  if (mode !== "client") return null;

  const customerConfig = customer as CustomerConfig;

  const gallery = customerConfig.about?.gallery || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6 py-24">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Samples
          </h1>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Explore examples of our recent work and projects.
          </p>
        </div>

        {/* EMPTY */}
        {gallery.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-lg">
              Gallery images will be added soon.
            </p>
          </div>
        ) : (
          /* MASONRY COLLAGE */
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {gallery.map((url, index) => (
              <div
                key={index}
                className="break-inside-avoid overflow-hidden rounded-3xl shadow-lg bg-white"
              >
                <img
                  src={normalizeGoogleDriveImage(url)}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full object-cover hover:scale-[1.02] transition duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}