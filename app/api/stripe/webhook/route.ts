import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const resend = new Resend(process.env.RESEND_API_KEY!);

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
    console.error("❌ Webhook signature verification failed:", err);
    return new NextResponse("Webhook error", { status: 400 });
  }

  /* --------------------------------------------------
   * ✅ PAYMENT CONFIRMED
   * -------------------------------------------------- */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const siteId = session.metadata?.siteId;
    const email = session.metadata?.email;
    const subdomain = session.metadata?.subdomain;

    if (!siteId || !email || !subdomain) {
      console.error("❌ Missing Stripe metadata", {
        siteId,
        email,
        subdomain,
      });
      return NextResponse.json({ received: true });
    }

    const supabase = getSupabase();

    /* --------------------------------------------------
     * 1️⃣ Activate site (idempotent)
     * -------------------------------------------------- */
    const { data: site } = await supabase
      .from("sites")
      .select("is_paid")
      .eq("site_id", siteId)
      .maybeSingle();

    // Prevent double processing
    if (!site?.is_paid) {
      await supabase
        .from("sites")
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
        })
        .eq("site_id", siteId);

      /* --------------------------------------------------
       * 2️⃣ Send onboarding email
       * -------------------------------------------------- */
      await resend.emails.send({
        from: "SimpleBookMe <onboarding@simplebookme.com>",
        to: email,
        subject: "🎉 Your booking website is live!",
        html: onboardingEmailHtml({
          siteId,
          subdomain,
        }),
      });

      console.log("✅ Site activated + email sent:", siteId);
    } else {
      console.log("ℹ️ Site already activated:", siteId);
    }
  }

  return NextResponse.json({ received: true });
}

/* --------------------------------------------------
 * 📧 EMAIL TEMPLATE
 * -------------------------------------------------- */
function onboardingEmailHtml({
  siteId,
  subdomain,
}: {
  siteId: string;
  subdomain: string;
}) {
  return `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>🎉 Your booking site is live!</h2>

    <p>Thanks for your purchase. Your booking website is now active.</p>

    <p>
      <strong>Live website:</strong><br/>
      <a href="https://${subdomain}.simplebookme.com">
        https://${subdomain}.simplebookme.com
      </a>
    </p>

    <p>
      <strong>Manage your site:</strong><br/>
      <a href="https://simplebookme.com/site/${siteId}">
        Edit your booking site
      </a>
    </p>

    <hr />

    <h3>Next steps</h3>
    <ul>
      <li>Add or update your services</li>
      <li>Test the booking flow</li>
      <li>Share your website with clients</li>
    </ul>

    <p>If you need help, just reply to this email — we’re happy to help.</p>

    <p>— SimpleBookMe Team</p>
  </div>
  `;
}
