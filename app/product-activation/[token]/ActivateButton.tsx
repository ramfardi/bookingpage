
"use client";

import { useState } from "react";

type ActivateButtonProps = {
  token: string;
};

export default function ActivateButton({
  token,
}: ActivateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleActivate() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/stripe/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activationToken: token,
          }),
        }
      );

      const result: unknown =
        await response.json().catch(() => null);

      const data =
        result &&
        typeof result === "object" &&
        !Array.isArray(result)
          ? (result as Record<string, unknown>)
          : null;

      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Unable to start payment."
        );
      }

      if (
        typeof data?.url !== "string" ||
        !data.url
      ) {
        throw new Error(
          "Stripe did not return a checkout URL."
        );
      }

      const checkoutUrl = new URL(data.url);

      if (checkoutUrl.protocol !== "https:") {
        throw new Error(
          "Invalid Stripe checkout URL."
        );
      }

      // Redirect to Stripe hosted checkout.
      window.location.assign(checkoutUrl.toString());

    } catch (cause) {
      console.error(
        "Activation checkout error:",
        cause
      );

      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to start checkout. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">

      <button
        type="button"
        onClick={handleActivate}
        disabled={loading}
        className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Opening secure checkout..."
          : "Activate Now →"}
      </button>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4"
        >
          <p className="text-sm font-medium text-rose-800">
            {error}
          </p>

          {error.includes("already been activated") && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-semibold text-indigo-700 underline"
            >
              Refresh activation status
            </button>
          )}
        </div>
      )}
    </div>
  );
}
