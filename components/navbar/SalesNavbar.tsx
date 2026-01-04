"use client";

import { useRouter } from "next/navigation";

export default function SalesNavbar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="font-bold text-lg">
          Simple<span className="text-indigo-600">BookMe</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/pricing")}
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Pricing
          </button>

          <button
            onClick={() => router.push("/about")}
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            About
          </button>

          <button
            onClick={() => router.push("/setup")}
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold"
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}
