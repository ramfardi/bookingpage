import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();

  // ✅ headers() is async in Next 15
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new NextResponse("Webhook error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const siteId = session.metadata?.siteId;
    const email = session.metadata?.email;

    if (!siteId) {
      console.error("Missing siteId in Stripe metadata");
      return NextResponse.json({ received: true });
    }

    // ✅ THIS IS WHERE YOU ACTIVATE THE SITE
    // TODO:
    // - Update Supabase:
    //   isPaid = true
    //   paidAt = new Date()
    //   generate subdomain
    // - Send confirmation email

    console.log("✅ Activate site:", siteId, email);
  }

  return NextResponse.json({ received: true });
}
