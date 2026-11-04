
import Stripe from "stripe";
import { NextResponse } from "next/server";

import { getBillingDb } from "@/app/lib/billing/db";
import {
  getBillingProduct,
  isProductKey,
} from "@/app/lib/billing/products";
import { hashActivationToken } from "@/app/lib/billing/tokens";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidSubdomain(subdomain: string) {
  return (
    subdomain.length >= 3 &&
    subdomain.length <= 25 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subdomain)
  );
}

function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured."
    );
  }

  return appUrl.replace(/\/+$/, "");
}

function jsonError(error: string, status: number) {
  return NextResponse.json(
    { error },
    { status }
  );
}

/* =====================================================
   NEW: REUSABLE PRODUCT CHECKOUT

   Supports:
   - Cleaning Quote Generator
   - Future Availability Page
   - Future Pricing Page
   - Other products registered in products.ts

   Request:
   {
     activationToken: "..."
   }

   Does not trust client-provided prices,
   customer emails, or product identifiers.
===================================================== */

async function createProductCheckout(
  activationToken: string
) {
  if (!/^[a-f0-9]{64}$/.test(activationToken)) {
    return jsonError(
      "Invalid activation link.",
      400
    );
  }

  // Hash the token before querying Supabase.
  const tokenHash =
    hashActivationToken(activationToken);

  const supabase = getBillingDb();

  const { data: activation, error } =
    await supabase
      .from("product_activations")
      .select(`
        id,
        product_key,
        resource_id,
        customer_email,
        paid_at
      `)
      .eq("activation_token_hash", tokenHash)
      .maybeSingle();

  if (error) {
    console.error(
      "Billing activation lookup failed:",
      error
    );

    return jsonError(
      "Unable to load activation information.",
      500
    );
  }

  if (!activation) {
    return jsonError(
      "Activation link not found.",
      404
    );
  }

  // Prevent purchases for unknown product types.
  if (!isProductKey(activation.product_key)) {
    return jsonError(
      "This product is not configured for payment.",
      400
    );
  }

  // Prevent payment when already activated.
  if (activation.paid_at !== null) {
    return jsonError(
      "This product has already been activated.",
      409
    );
  }

  const product =
    getBillingProduct(activation.product_key);

  // Each product has its own Stripe Price ID.
  const stripePriceId =
    process.env[product.stripePriceEnv];

  if (!stripePriceId) {
    console.error(
      "Missing Stripe price configuration:",
      product.stripePriceEnv
    );

    return jsonError(
      "Payment is not configured for this product.",
      503
    );
  }

  const email = activation.customer_email;

  if (!isValidEmail(email)) {
    return jsonError(
      "This product has an invalid billing email.",
      400
    );
  }

  const appUrl = getAppUrl();

  // Create a Stripe Checkout Session.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],

    // Internal billing record reference.
    client_reference_id: activation.id,

    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],

    // Used by the reusable Stripe webhook.
    metadata: {
      billingVersion: "1",
      activationId: activation.id,
      productKey: activation.product_key,
      resourceId: activation.resource_id,
    },

    customer_email: email,

    success_url:
      `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url:
      `${appUrl}/cancel`,
  });

  if (!session.url) {
    throw new Error(
      "Stripe did not create a checkout URL."
    );
  }

  return NextResponse.json({
    url: session.url,
  });
}

/* =====================================================
   EXISTING: BOOKING WEBSITE CHECKOUT

   This preserves your original implementation.

   Request:
   {
     siteId: "...",
     email: "...",
     subdomain: "..."
   }

   Original price: $19.90 USD.
===================================================== */

async function createWebsiteCheckout(
  body: Record<string, unknown>
) {
  const siteId =
    typeof body.siteId === "string"
      ? body.siteId.trim()
      : "";

  const email =
    typeof body.email === "string"
      ? body.email.trim()
      : "";

  const subdomain =
    typeof body.subdomain === "string"
      ? body.subdomain.trim().toLowerCase()
      : "";

  if (!siteId) {
    return jsonError(
      "Missing siteId.",
      400
    );
  }

  if (!isValidEmail(email)) {
    return jsonError(
      "A valid email address is required.",
      400
    );
  }

  if (!isValidSubdomain(subdomain)) {
    return jsonError(
      "Invalid website subdomain.",
      400
    );
  }

  const appUrl = getAppUrl();

  // Original booking website checkout.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],

    client_reference_id: siteId,

    line_items: [
      {
        price_data: {
          currency: "USD",
          product_data: {
            name:
              "SimpleBookMe – Website Activation",
          },
          unit_amount: 1990,
        },
        quantity: 1,
      },
    ],

    // Original metadata kept unchanged.
    metadata: {
      siteId,
      email,
      subdomain,
    },

    customer_email: email,

    success_url:
      `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url:
      `${appUrl}/cancel`,
  });

  if (!session.url) {
    throw new Error(
      "Stripe did not create a checkout URL."
    );
  }

  return NextResponse.json({
    url: session.url,
  });
}

/* =====================================================
   SHARED POST HANDLER

   Automatically routes to the appropriate
   checkout based on the request body.
===================================================== */

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return jsonError(
        "Invalid request body.",
        400
      );
    }

    const payload =
      body as Record<string, unknown>;

    // NEW: Product checkout via activation token.
    if (
      Object.prototype.hasOwnProperty.call(
        payload,
        "activationToken"
      )
    ) {
      if (
        typeof payload.activationToken !== "string"
      ) {
        return jsonError(
          "Invalid activation token.",
          400
        );
      }

      return await createProductCheckout(
        payload.activationToken
      );
    }

    // Avoid accidentally treating a product request
    // without a token as legacy website checkout.
    if (
      Object.prototype.hasOwnProperty.call(
        payload,
        "productKey"
      )
    ) {
      return jsonError(
        "An activation token is required.",
        400
      );
    }

    // EXISTING: Booking website checkout.
    return await createWebsiteCheckout(payload);

  } catch (error) {
    console.error(
      "Stripe checkout error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create Stripe checkout session.",
      },
      { status: 500 }
    );
  }
}
