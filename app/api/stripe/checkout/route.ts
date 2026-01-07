import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Simple email validator (good enough for Stripe)
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { siteId, email } = body;

    if (!siteId) {
      return NextResponse.json(
        { error: "Missing siteId" },
        { status: 400 }
      );
    }

    // Only pass customer_email to Stripe if valid
    const customerEmail =
      typeof email === "string" && isValidEmail(email)
        ? email
        : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "SimpleBookMe – Website Activation",
            },
            unit_amount: 4900, // $49.00 CAD
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,

      ...(customerEmail && { customer_email: customerEmail }),

      // 🔑 CRITICAL: metadata for webhook activation
      metadata: {
        siteId,
        ...(customerEmail && { email: customerEmail }),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
