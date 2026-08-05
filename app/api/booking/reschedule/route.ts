export const runtime = "nodejs";

import { verifyToken, signToken } from "@/app/lib/bookingTokens";
import { Resend } from "resend";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import { getSupabase } from "@/app/lib/supabase";

const supabase = getSupabase();
const resend = new Resend(process.env.RESEND_API_KEY!);

/* ======================
   GET – Show reschedule form
====================== */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");

  if (!token) {
    return new Response("Invalid link", { status: 400 });
  }

  try {
    verifyToken(token);
  } catch {
    return new Response("Invalid or expired link", { status: 400 });
  }

  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; padding: 40px;">
        <h2>Propose new appointment time</h2>
        <form method="POST">
          <label>
            Date:<br />
            <input type="date" name="date" required />
          </label><br /><br />
          <label>
            Time:<br />
            <input type="time" name="time" required />
          </label><br /><br />
          <input type="hidden" name="token" value="${token}" />
          <button type="submit">Send to client</button>
        </form>
      </body>
    </html>
    `,
    { headers: { "Content-Type": "text/html" } }
  );
}

/* ======================
   POST – Send proposal
====================== */
export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const token = form.get("token")?.toString();
    const date = form.get("date")?.toString();
    const time = form.get("time")?.toString();

    if (!token || !date || !time) {
      return new Response("Invalid request", { status: 400 });
    }

    const data = verifyToken(token);

    if (!data.siteId || !data.customer_email) {
      return new Response("Invalid token", { status: 400 });
    }

    /* ======================
       Fetch business details
    ====================== */
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("data")
      .eq("site_id", data.siteId)
      .single();

    if (siteError || !site) {
      console.error("Reschedule site lookup error:", siteError);

      return new Response("Business website not found", {
        status: 404,
      });
    }

    const customer = site.data as CustomerConfig;
    const providerEmail = customer.email?.bookingNotifications;

    if (!providerEmail) {
      return new Response("Provider email is not configured", {
        status: 400,
      });
    }

    /* ======================
       Create updated token
    ====================== */
    const newToken = signToken({
      ...data,
      preferred_date: date,
      preferred_time: time,
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      "https://simplebookme.com";

    const confirmUrl =
      `${baseUrl}/api/booking/confirm?token=${encodeURIComponent(
        newToken
      )}`;

    /* ======================
       Email client
    ====================== */
    const { error: clientEmailError } =
      await resend.emails.send({
        from: "Booking <booking@simplebookme.com>",
        to: data.customer_email,
        replyTo: customer.email?.replyTo ?? providerEmail,
        subject: `New appointment time proposed – ${customer.businessName}`,
        html: `
          <h2>New appointment time proposed</h2>

          <p>
            <strong>${customer.businessName}</strong>
            has proposed a new appointment time.
          </p>

          <p><strong>Service:</strong> ${data.service}</p>
          <p><strong>New date:</strong> ${date}</p>
          <p><strong>New time:</strong> ${time}</p>

          <p style="margin-top:20px;">
            <a
              href="${confirmUrl}"
              style="
                display:inline-block;
                padding:12px 18px;
                background:#4f46e5;
                color:white;
                text-decoration:none;
                border-radius:6px;
                font-weight:bold;
              "
            >
              Accept new time
            </a>
          </p>

          <p style="font-size:12px;color:#666;">
            The appointment is not confirmed until you accept
            the proposed time.
          </p>
        `,
      });

    if (clientEmailError) {
      console.error(
        "Reschedule client email error:",
        clientEmailError
      );

      return new Response(
        `Could not email the client: ${clientEmailError.message}`,
        { status: 500 }
      );
    }

    /* ======================
       Email business owner
    ====================== */
    const { error: providerEmailError } =
      await resend.emails.send({
        from: "Booking <booking@simplebookme.com>",
        to: providerEmail,
        subject: "New appointment time proposal sent",
        html: `
          <h2>New time proposal sent</h2>

          <p>
            Your proposed appointment time has been sent to the client.
          </p>

          <p><strong>Client:</strong> ${data.customer_email}</p>
          <p><strong>Service:</strong> ${data.service}</p>
          <p><strong>New date:</strong> ${date}</p>
          <p><strong>New time:</strong> ${time}</p>

          <p>
            The client will receive another email after accepting
            the proposed time.
          </p>
        `,
      });

    if (providerEmailError) {
      console.error(
        "Reschedule provider email error:",
        providerEmailError
      );

      return new Response(
        `The client was emailed, but the business copy failed: ${providerEmailError.message}`,
        { status: 500 }
      );
    }

    return new Response(
      "New time proposal was sent to the client and business owner.",
      { status: 200 }
    );
  } catch (err) {
    console.error("Reschedule error:", err);

    return new Response(
      err instanceof Error
        ? `Unable to send proposal: ${err.message}`
        : "Invalid or expired link.",
      { status: 400 }
    );
  }
}
