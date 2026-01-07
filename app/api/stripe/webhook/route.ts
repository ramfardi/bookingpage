import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new NextResponse("Webhook error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const siteId = session.metadata?.siteId;
    const email = session.metadata?.email;

    if (!siteId) {
      console.error("Missing siteId in metadata");
      return NextResponse.json({ received: true });
    }

    // ✅ ACTIVATE WEBSITE
    // 1. Mark isPaid = true
    // 2. Set paidAt
    // 3. Generate subdomain
    // 4. Send email to user

    console.log("Activate site:", siteId, email);
  }

  return NextResponse.json({ received: true });
}
