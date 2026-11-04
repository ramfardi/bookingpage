
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { Resend } from "resend";

// New reusable billing imports
import { getBillingDb } from "@/app/lib/billing/db";
import {
  getBillingProduct,
  isProductKey,
} from "@/app/lib/billing/products";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

function received() {
  return NextResponse.json({ received: true });
}

function webhookError(message: string, status = 500) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/* ======================================================
   NEW: REUSABLE PRODUCT ACTIVATION

   Handles:
   - Cleaning Quote
   - Future Availability Page
   - Future Pricing Page
   - Other configured products

   Uses the product_activations table.
====================================================== */

async function activateBillingProduct(
  session: Stripe.Checkout.Session
) {
  const metadata = session.metadata;

  const activationId = metadata?.activationId;
  const productKey = metadata?.productKey;
  const resourceId = metadata?.resourceId;

  if (
    !activationId ||
    !productKey ||
    !resourceId ||
    !isProductKey(productKey)
  ) {
    console.error(
      "Invalid product billing metadata:",
      session.id
    );

    return webhookError(
      "Invalid product billing metadata.",
      400
    );
  }

  // Verify that the session belongs to this
  // internal billing record.
  if (session.client_reference_id !== activationId) {
    console.error(
      "Billing reference mismatch:",
      session.id
    );

    return webhookError(
      "Billing reference mismatch.",
      400
    );
  }

  if (session.mode !== "payment") {
    return webhookError(
      "Unexpected Stripe payment mode.",
      400
    );
  }

  const product = getBillingProduct(productKey);
  const supabase = getBillingDb();

  // Retrieve the billing record.
  const { data: activation, error: lookupError } =
    await supabase
      .from("product_activations")
      .select(`
        id,
        product_key,
        resource_id,
        customer_email,
        paid_at,
        stripe_checkout_session_id,
        payment_email_sent_at
      `)
      .eq("id", activationId)
      .maybeSingle();

  if (lookupError) {
    console.error(
      "Billing lookup error:",
      lookupError
    );

    return webhookError(
      "Unable to load billing record."
    );
  }

  if (!activation) {
    console.error(
      "Unknown billing activation:",
      activationId
    );

    return webhookError(
      "Billing record not found.",
      404
    );
  }

  // Ensure the Stripe metadata matches
  // the database record.
  if (
    activation.product_key !== productKey ||
    activation.resource_id !== resourceId
  ) {
    console.error(
      "Billing metadata does not match database:",
      activationId
    );

    return webhookError(
      "Billing product mismatch.",
      400
    );
  }

  // Verify that the customer purchased the
  // correct Stripe Price for this product.
  const expectedPriceId =
    process.env[product.stripePriceEnv];

  if (!expectedPriceId) {
    console.error(
      "Missing product Stripe price:",
      product.stripePriceEnv
    );

    return webhookError(
      "Stripe price configuration missing."
    );
  }

  const lineItems =
    await stripe.checkout.sessions.listLineItems(
      session.id,
      { limit: 2 }
    );

  const purchasedItem = lineItems.data[0];

  if (
    lineItems.data.length !== 1 ||
    lineItems.has_more ||
    purchasedItem?.price?.id !== expectedPriceId ||
    purchasedItem?.quantity !== 1
  ) {
    console.error(
      "Unexpected Stripe product or quantity:",
      session.id
    );

    return webhookError(
      "Purchased product verification failed.",
      400
    );
  }

  // Handle an activation that may already have
  // been fulfilled by another webhook attempt.
  let current = activation;

  if (!current.paid_at) {
    const now = new Date().toISOString();

    // Only the first successful update activates.
    const { data: updated, error: updateError } =
      await supabase
        .from("product_activations")
        .update({
          paid_at: now,
          stripe_checkout_session_id: session.id,
          updated_at: now,
        })
        .eq("id", activation.id)
        .is("paid_at", null)
        .select(`
          id,
          product_key,
          resource_id,
          customer_email,
          paid_at,
          stripe_checkout_session_id,
          payment_email_sent_at
        `)
        .maybeSingle();

    if (updateError) {
      console.error(
        "Product activation failed:",
        updateError
      );

      return webhookError(
        "Unable to activate product."
      );
    }

    if (updated) {
      current = updated;

      console.log(
        "Product activated:",
        productKey,
        resourceId
      );
    } else {
      // Another webhook may have updated the row.
      const { data: fresh, error: freshError } =
        await supabase
          .from("product_activations")
          .select(`
            id,
            product_key,
            resource_id,
            customer_email,
            paid_at,
            stripe_checkout_session_id,
            payment_email_sent_at
          `)
          .eq("id", activation.id)
          .single();

      if (freshError || !fresh?.paid_at) {
        console.error(
          "Unable to confirm product activation:",
          freshError
        );

        return webhookError(
          "Unable to confirm activation."
        );
      }

      current = fresh;
    }
  }

  // If a different Checkout Session already
  // activated this product, do not fulfill twice.
  if (
    current.stripe_checkout_session_id !== session.id
  ) {
    console.warn(
      "Another paid Checkout Session exists for:",
      productKey,
      resourceId,
      session.id
    );

    // Review duplicate charges separately in Stripe.
    return received();
  }

  // Confirmation already accepted by Resend.
  if (current.payment_email_sent_at) {
    return received();
  }

  // Send a generic confirmation email.
  // Product-specific welcome emails with public
  // and private links are handled separately.
  const { error: emailError } =
    await resend.emails.send(
      {
        from:
          "SimpleBookMe <onboarding@simplebookme.com>",

        to: current.customer_email,

        subject:
          `Your ${product.name} is activated!`,

        html: productActivationEmailHtml({
          productName: product.name,
        }),
      },
      {
        // Avoid duplicate emails on Stripe retries.
        idempotencyKey:
          `simplebookme-product-activation-${activation.id}`,
      }
    );

  if (emailError) {
    console.error(
      "Product activated but confirmation email failed:",
      emailError
    );

    // Returning 500 allows Stripe to retry.
    // The product is already activated safely.
    return webhookError(
      "Unable to send product confirmation."
    );
  }

  // Mark the confirmation as sent.
  const { error: emailUpdateError } =
    await supabase
      .from("product_activations")
      .update({
        payment_email_sent_at:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", activation.id)
      .is("payment_email_sent_at", null);

  if (emailUpdateError) {
    console.error(
      "Unable to record confirmation email:",
      emailUpdateError
    );

    return webhookError(
      "Unable to record payment confirmation."
    );
  }

  console.log(
    "Product activated and confirmation sent:",
    productKey,
    resourceId
  );

  return received();
}

/* ======================================================
   EXISTING: BOOKING WEBSITE ACTIVATION

   Preserves your current behavior:
   - Uses the sites table
   - Updates is_paid
   - Sends existing onboarding email
====================================================== */

async function activateBookingWebsite(
  session: Stripe.Checkout.Session
) {
  const siteId = session.metadata?.siteId;
  const email = session.metadata?.email;
  const subdomain = session.metadata?.subdomain;

  if (!siteId || !email || !subdomain) {
    console.error("Missing Stripe metadata:", {
      siteId,
      email,
      subdomain,
    });

    return webhookError(
      "Missing required Stripe metadata.",
      400
    );
  }

  const supabase = getSupabase();

  const {
    data: site,
    error: siteLookupError,
  } = await supabase
    .from("sites")
    .select("is_paid")
    .eq("site_id", siteId)
    .maybeSingle();

  if (siteLookupError) {
    console.error(
      "Unable to find website:",
      siteLookupError
    );

    return webhookError(
      "Unable to find website."
    );
  }

  if (!site) {
    console.error(
      "Stripe payment references an unknown website:",
      siteId
    );

    return webhookError(
      "Website not found.",
      404
    );
  }

  if (site.is_paid) {
    console.log(
      "Website already activated:",
      siteId
    );

    return received();
  }

  // Conditional update prevents repeat activation
  // when simultaneous webhook requests arrive.
  const { data: updatedSite, error: activationError } =
    await supabase
      .from("sites")
      .update({
        is_paid: true,
      })
      .eq("site_id", siteId)
      .is("is_paid", false)
      .select("site_id")
      .maybeSingle();

  if (activationError) {
    console.error(
      "Unable to activate website:",
      activationError
    );

    return webhookError(
      "Unable to activate website."
    );
  }

  if (!updatedSite) {
    // The state may have changed concurrently.
    const { data: latest, error: latestError } =
      await supabase
        .from("sites")
        .select("is_paid")
        .eq("site_id", siteId)
        .maybeSingle();

    if (latestError || !latest?.is_paid) {
      return webhookError(
        "Unable to confirm website activation."
      );
    }

    return received();
  }

  // Original onboarding email.
  try {
    const { error: emailError } =
      await resend.emails.send({
        from:
          "SimpleBookMe <onboarding@simplebookme.com>",

        to: email,

        subject:
          "🎉 Your booking website is live!",

        html: onboardingEmailHtml({
          siteId,
          subdomain,
        }),
      });

    if (emailError) {
      console.error(
        "Website activated but onboarding email failed:",
        emailError
      );
    }
  } catch (emailError) {
    console.error(
      "Website activated but onboarding email failed:",
      emailError
    );
  }

  console.log(
    "Website activated:",
    siteId
  );

  return received();
}

/* ======================================================
   MAIN STRIPE WEBHOOK
====================================================== */

export async function POST(req: Request) {
  const body = await req.text();

  const headersList = await headers();
  const signature =
    headersList.get("stripe-signature");

  if (!signature) {
    return new NextResponse(
      "Missing Stripe signature",
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error(
      "Webhook signature verification failed:",
      error
    );

    return new NextResponse(
      "Webhook signature verification failed",
      { status: 400 }
    );
  }

  // Card payments use checkout.session.completed.
  // Also support successful delayed payments
  // if additional payment methods are added later.
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session =
      event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      console.log(
        "Checkout completed but payment is not paid:",
        session.id
      );

      return received();
    }

    try {
      // NEW: Shared product billing flow.
      if (session.metadata?.billingVersion === "1") {
        return await activateBillingProduct(session);
      }

      // Reject unexpected billing protocol versions
      // instead of treating them as booking payments.
      if (session.metadata?.billingVersion) {
        return webhookError(
          "Unknown billing version.",
          400
        );
      }

      // EXISTING: Original booking website flow.
      return await activateBookingWebsite(session);

    } catch (error) {
      console.error(
        "Stripe fulfillment error:",
        error
      );

      return webhookError(
        "Stripe fulfillment failed."
      );
    }
  }

  return received();
}

/* ======================================================
   NEW: PRODUCT ACTIVATION CONFIRMATION EMAIL
====================================================== */

function productActivationEmailHtml({
  productName,
}: {
  productName: string;
}) {
  return `
    <div style="
      font-family: Inter, Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      line-height: 1.6;
      color: #111827;
    ">
      <h2>🎉 Your ${productName} is activated!</h2>

      <p>
        Thank you for your purchase.
        Your SimpleBookMe product is now activated.
      </p>

      <p>
        Your public page and private editing link
        remain the same.
      </p>

      <p>
        You can continue sharing your public page
        with customers and updating your settings
        using your private edit link.
      </p>

      <p>
        This was a one-time payment.
        There is no monthly subscription.
      </p>

      <p>
        If you need help, reply to this email.
      </p>

      <p>— SimpleBookMe Team</p>
    </div>
  `;
}

/* ======================================================
   EXISTING: BOOKING WEBSITE ONBOARDING EMAIL
   Retained from your original webhook.
====================================================== */

function onboardingEmailHtml({
  siteId,
  subdomain,
}: {
  siteId: string;
  subdomain: string;
}) {
  const publicUrl =
    `https://${subdomain}.simplebookme.com`;

  const privateUrl =
    `https://simplebookme.com/site/${siteId}?mode=preview`;

  return `
    <div style="
      font-family: Inter, Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      line-height: 1.6;
      color: #111827;
    ">
      <h2>🎉 Your booking website is live!</h2>

      <p>
        Thanks for your purchase. Your booking website
        is now activated.
      </p>

      <p>
        <strong>Live website:</strong><br />
        <a href="${publicUrl}">
          ${publicUrl}
        </a>
      </p>

      <p>
        <strong>Private edit link:</strong><br />
        <a href="${privateUrl}">
          Edit your booking website
        </a>
      </p>

      <p style="color: #b91c1c;">
        Keep the private edit link secure.
        Do not share it with customers.
      </p>

      <hr />

      <h3>Next steps</h3>

      <ul>
        <li>Add or update your services</li>
        <li>Test the booking flow</li>
        <li>Share your public website with customers</li>
      </ul>

      <p>
        If you need help, reply to this email.
      </p>

      <p>— SimpleBookMe Team</p>
    </div>
  `;
}
