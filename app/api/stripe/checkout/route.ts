import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Simple email validator (good enough for Stripe)
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { siteId, email, subdomain } = await req.json();

    // 🔒 HARD VALIDATION (prevents broken Stripe sessions)
    if (!siteId || !subdomain) {
      return NextResponse.json(
        { error: "Missing siteId or subdomain" },
        { status: 400 }
      );
    }

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
            unit_amount: 3900,
          },
          quantity: 1,
        },
      ],

      // ✅ DO NOT send undefined metadata (breaks webhook)
      metadata: {
        siteId,
        subdomain,
        ...(customerEmail && { email: customerEmail }),
      },

      // ✅ Stripe-hosted receipt email
      ...(customerEmail && { customer_email: customerEmail }),

      // ✅ MUST redirect to an existing route
	success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
	cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err.message ?? "Stripe error" },
      { status: 500 }
    );
  }
}
