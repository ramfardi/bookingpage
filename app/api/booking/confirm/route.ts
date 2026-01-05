export const runtime = "nodejs";

import type { CustomerConfig } from "@/app/lib/customerConfig";
import { verifyToken } from "@/app/lib/bookingTokens";
import { createICS } from "@/app/lib/calendar";
import { Resend } from "resend";
import { getSupabase } from "@/app/lib/supabase";

const supabase = getSupabase();
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get("token");
    if (!token) {
      return new Response("Missing token", { status: 400 });
    }

    const data = verifyToken(token);
    const {
      siteId,
      service,
      preferred_date,
      preferred_time,
      customer_email,
      eventUID,
    } = data;

    if (!siteId) {
      return new Response("Invalid token", { status: 400 });
    }

    /* =====================
       Fetch site config
    ===================== */
    const { data: site, error } = await supabase
      .from("sites")
      .select("data")
      .eq("site_id", siteId)
      .single();

    if (error || !site) {
      return new Response("Invalid customer", { status: 404 });
    }

    const customer = site.data as CustomerConfig;

    if (!customer.email?.bookingNotifications) {
      return new Response("Provider email not configured", { status: 400 });
    }

    /* =====================
       Calendar (.ics)
    ===================== */
    const start = new Date(`${preferred_date}T${preferred_time}`);

    const ics = createICS({
      uid: eventUID,
      title: `Booking with ${customer.businessName}`,
      description: `Service: ${service}`,
      start,
    });

    const attachment = {
      filename: "booking.ics",
      content: Buffer.from(ics).toString("base64"),
    };

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "https://simplebookme.com";

    const rescheduleUrl =
      `${baseUrl}/api/booking/reschedule?token=${encodeURIComponent(token)}`;

    /* =====================
       EMAIL → CLIENT
       (CONFIRM + MODIFY)
    ===================== */
    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: customer_email,
      subject: "Your appointment is confirmed",
      html: `
        <h2>Appointment Confirmed</h2>

        <p><strong>Business:</strong> ${customer.businessName}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${preferred_date}</p>
        <p><strong>Time:</strong> ${preferred_time}</p>

        <p style="margin-top:20px;">
          If you need to change the appointment time, you can request a modification:
        </p>

        <p>
          <a href="${rescheduleUrl}"
             style="
               display:inline-block;
               padding:12px 18px;
               background:#f59e0b;
               color:white;
               text-decoration:none;
               border-radius:6px;
               font-weight:600;
             ">
            Modify appointment
          </a>
        </p>

        <p style="margin-top:16px;font-size:12px;color:#666;">
          This request will be sent to the business for approval.
        </p>
      `,
      attachments: [attachment],
    });

    /* =====================
       EMAIL → PROVIDER
       (NO MODIFY BUTTON)
    ===================== */
    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: customer.email.bookingNotifications,
      subject: "Appointment confirmed",
      html: `
        <h2>Appointment Confirmed</h2>

        <p><strong>Client:</strong> ${customer_email}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${preferred_date}</p>
        <p><strong>Time:</strong> ${preferred_time}</p>
      `,
      attachments: [attachment],
    });

    return new Response(
      "Appointment confirmed. You may close this tab.",
      { status: 200 }
    );
  } catch (err) {
    console.error("Confirm booking error:", err);
    return new Response("Invalid or expired link.", { status: 400 });
  }
}
