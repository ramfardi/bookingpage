
import type { Metadata } from "next";
import Stripe from "stripe";

import { getBillingDb } from "@/app/lib/billing/db";
import {
  getBillingProduct,
  isProductKey,
} from "@/app/lib/billing/products";
import { hashActivationToken } from "@/app/lib/billing/tokens";

import ActivateButton from "./ActivateButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Activate Your Page | SimpleBookMe",
  description: "Activate your SimpleBookMe product.",
  robots: {
    index: false,
    follow: false,
  },
  referrer: "no-referrer",
};

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/* =========================================
   REUSABLE MESSAGE PAGE
========================================= */

function MessagePage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

        <div className="mb-5 text-xl font-bold text-indigo-600">
          SimpleBookMe
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          {message}
        </p>

        <a
          href="/"
          className="mt-7 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to SimpleBookMe
        </a>
      </div>
    </main>
  );
}

/* =========================================
   ACTIVATION PAGE
========================================= */

export default async function ActivationPage({
  params,
}: PageProps) {
  const { token } = await params;

  // Validate activation token format.
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return (
      <MessagePage
        title="Invalid activation link"
        message="This activation link is invalid. Please use the link from your SimpleBookMe welcome email."
      />
    );
  }

  const tokenHash = hashActivationToken(token);

  const supabase = getBillingDb();

  // Find the associated product.
  const {
    data: activation,
    error,
  } = await supabase
    .from("product_activations")
    .select(`
      id,
      product_key,
      resource_id,
      customer_email,
      trial_started_at,
      paid_at
    `)
    .eq("activation_token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error(
      "Activation lookup error:",
      error
    );

    return (
      <MessagePage
        title="Unable to load activation"
        message="We couldn't check your activation status. Please try again later."
      />
    );
  }

  if (!activation) {
    return (
      <MessagePage
        title="Activation link not found"
        message="We couldn't find a product associated with this activation link. Please check the link in your welcome email."
      />
    );
  }

  // Check product configuration.
  if (!isProductKey(activation.product_key)) {
    return (
      <MessagePage
        title="Product not available"
        message="This product is not currently configured for activation."
      />
    );
  }

  const product = getBillingProduct(
    activation.product_key
  );

  // Already activated.
  if (activation.paid_at !== null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm">

          <div className="mb-4 text-5xl">
            ✅
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Your Page Is Already Activated!
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Your {product.name} has already been activated.
            No additional payment is required.
          </p>

          <p className="mt-3 text-sm text-slate-600">
            You can continue using your existing
            public and private editing links.
          </p>

          <a
            href="/"
            className="mt-7 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to SimpleBookMe
          </a>
        </div>
      </main>
    );
  }

  /* =========================================
     CHECK TRIAL STATUS
  ========================================= */

  const trialStartedAt = new Date(
    activation.trial_started_at
  ).getTime();

  if (!Number.isFinite(trialStartedAt)) {
    return (
      <MessagePage
        title="Unable to load trial"
        message="The trial information could not be loaded."
      />
    );
  }

  const trialEndsAt = new Date(
    trialStartedAt + product.trialDays * DAY_MS
  );

  const remainingMs =
    trialEndsAt.getTime() - Date.now();

  const trialExpired = remainingMs <= 0;

  const daysRemaining = Math.max(
    0,
    Math.ceil(remainingMs / DAY_MS)
  );

  const formattedTrialEnd =
    trialEndsAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

  /* =========================================
     GET ACTUAL PRICE FROM STRIPE
  ========================================= */

  const priceId =
    process.env[product.stripePriceEnv];

  if (!priceId || !process.env.STRIPE_SECRET_KEY) {
    console.error(
      "Missing billing Stripe configuration:",
      product.stripePriceEnv
    );

    return (
      <MessagePage
        title="Payment temporarily unavailable"
        message="Payment isn't configured for this product yet. Your existing page and trial are not affected."
      />
    );
  }

  let formattedPrice: string;

  try {
    const stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY
    );

    const price = await stripe.prices.retrieve(
      priceId
    );

    if (
      !price.active ||
      price.type !== "one_time" ||
      price.unit_amount === null
    ) {
      throw new Error(
        "Stripe Price must be an active, fixed, one-time price."
      );
    }

    const currency = price.currency.toUpperCase();

    const formatter = new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
      }
    );

const decimals =
  formatter.resolvedOptions().maximumFractionDigits ?? 2;

formattedPrice =
  formatter.format(
    price.unit_amount / Math.pow(10, decimals)
  ) + ` ${currency}`;

  } catch (stripeError) {
    console.error(
      "Unable to retrieve Stripe price:",
      stripeError
    );

    return (
      <MessagePage
        title="Unable to load payment details"
        message="We couldn't retrieve the activation price. Please try again later."
      />
    );
  }

  /* =========================================
     MAIN ACTIVATION UI
  ========================================= */

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-50 px-4 py-12 sm:py-20">

      <div className="mx-auto w-full max-w-xl">

        {/* BRAND */}
        <div className="mb-8 text-center">
          <a
            href="/"
            className="text-xl font-extrabold tracking-tight text-indigo-600"
          >
            SimpleBookMe
          </a>

          <p className="mt-2 text-sm text-slate-500">
            Secure Product Activation
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

          <div className="border-b border-slate-100 px-6 py-8 text-center sm:px-10">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
              ✨
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-slate-950 sm:text-3xl">
              Activate Your Page
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Keep your {product.name} active
              after your free trial.
            </p>
          </div>

          <div className="space-y-6 px-6 py-8 sm:px-10">

            {/* PRODUCT INFORMATION */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Your product
              </p>

              <h2 className="mt-2 text-lg font-bold text-slate-900">
                {product.name}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                One-time activation
              </p>
            </div>

            {/* TRIAL INFORMATION */}
            {trialExpired ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                <p className="font-semibold text-amber-900">
                  Your free trial has ended
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Activate your page to restore access.
                  Your existing page settings will be preserved.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                <p className="font-semibold text-emerald-900">
                  Your free trial is active
                </p>

                <p className="mt-1 text-sm text-emerald-800">
                  {daysRemaining}{" "}
                  {daysRemaining === 1 ? "day" : "days"}{" "}
                  remaining
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  Trial ends: {formattedTrialEnd}
                </p>
              </div>
            )}

            {/* PAYMENT PRICE */}
            <div className="text-center">

              <p className="text-sm font-medium text-slate-500">
                One-time payment
              </p>

              <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">
                {formattedPrice}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                No monthly subscription.
              </p>
            </div>

            {/* STRIPE CHECKOUT BUTTON */}
            <ActivateButton token={token} />

            <p className="text-center text-xs leading-6 text-slate-500">
              Payments are securely processed by Stripe.
              You will be redirected to Stripe Checkout
              to complete your purchase.
            </p>

            <div className="border-t border-slate-100 pt-5">

              <div className="space-y-3 text-sm text-slate-600">
                <p>✓ Keep your existing public page</p>
                <p>✓ Continue updating your page</p>
                <p>✓ No recurring subscription</p>
                <p>✓ No need to recreate your links</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Need help? Contact SimpleBookMe support.
        </p>
      </div>
    </main>
  );
}
