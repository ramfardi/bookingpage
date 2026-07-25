import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const body = await req.text();

  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

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

  if (event.type === "checkout.session.completed") {
    const session =
      event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      console.log(
        "Checkout completed but payment is not paid:",
        session.id
      );

      return NextResponse.json({
        received: true,
      });
    }

    const siteId = session.metadata?.siteId;
    const email = session.metadata?.email;
    const subdomain = session.metadata?.subdomain;

    if (!siteId || !email || !subdomain) {
      console.error("Missing Stripe metadata:", {
        siteId,
        email,
        subdomain,
      });

      return NextResponse.json(
        {
          error: "Missing required Stripe metadata.",
        },
        { status: 400 }
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

      return NextResponse.json(
        {
          error: "Unable to find website.",
        },
        { status: 500 }
      );
    }

    if (!site) {
      console.error(
        "Stripe payment references an unknown website:",
        siteId
      );

      return NextResponse.json(
        {
          error: "Website not found.",
        },
        { status: 404 }
      );
    }

    if (site.is_paid) {
      console.log("Website already activated:", siteId);

      return NextResponse.json({
        received: true,
      });
    }

    const { error: activationError } = await supabase
      .from("sites")
      .update({
        is_paid: true,
      })
      .eq("site_id", siteId);

    if (activationError) {
      console.error(
        "Unable to activate website:",
        activationError
      );

      return NextResponse.json(
        {
          error: "Unable to activate website.",
        },
        { status: 500 }
      );
    }

    try {
      await resend.emails.send({
        from: "SimpleBookMe <onboarding@simplebookme.com>",
        to: email,
        subject: "🎉 Your booking website is live!",
        html: onboardingEmailHtml({
          siteId,
          subdomain,
        }),
      });
    } catch (emailError) {
      console.error(
        "Website activated, but onboarding email failed:",
        emailError
      );
    }

    console.log("Website activated:", siteId);
  }

  return NextResponse.json({
    received: true,
  });
}

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
        Thanks for your purchase. Your booking website is now
        activated.
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
        Keep the private edit link secure. Do not share it with
        customers.
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