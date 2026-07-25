import Stripe from "stripe";
import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
  try {
    const body = await req.json();

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
      return NextResponse.json(
        { error: "Missing siteId." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!isValidSubdomain(subdomain)) {
      return NextResponse.json(
        { error: "Invalid website subdomain." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      client_reference_id: siteId,

      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "SimpleBookMe – Website Activation",
            },
            unit_amount: 1990,
          },
          quantity: 1,
        },
      ],

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
      throw new Error("Stripe did not create a checkout URL.");
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Stripe checkout session.",
      },
      { status: 500 }
    );
  }
}