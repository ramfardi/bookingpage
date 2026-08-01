"use client";

import { useEffect, useState } from "react";

export default function ActivateSitePage() {
  const [error, setError] = useState("");

  useEffect(() => {
    async function startCheckout() {
      try {
        const parts = window.location.pathname.split("/");
        const siteId = parts[parts.length - 1];

        const params = new URLSearchParams(window.location.search);
        const email = params.get("email") || "";
        const subdomain = params.get("subdomain") || "";

        if (!siteId || !email || !subdomain) {
          setError("Missing activation information.");
          return;
        }

        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            siteId,
            email,
            subdomain,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.url) {
          throw new Error(
            data?.error || "Unable to start secure checkout."
          );
        }

        window.location.assign(data.url);
      } catch (error) {
        console.error("Activation checkout error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to start secure checkout."
        );
      }
    }

    startCheckout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">
          Opening secure checkout...
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Please wait while we prepare your activation link.
        </p>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}