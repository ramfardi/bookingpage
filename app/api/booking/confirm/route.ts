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
    const { siteId } = data;

    if (!siteId) {
      return new Response("Invalid token", { status: 400 });
    }

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

    const start = new Date(
      `${data.preferred_date}T${data.preferred_time}`
    );

    const ics = createICS({
      uid: data.eventUID,
      title: `Booking with ${customer.businessName}`,
      description: `Service: ${data.service}`,
      start,
    });

    const attachment = {
      filename: "booking.ics",
      content: Buffer.from(ics).toString("base64"),
    };

    /* CLIENT EMAIL */
    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: data.customer_email,
      subject: "Your appointment is confirmed",
      html: `
        <h2>Appointment Confirmed</h2>
        <p><strong>Business:</strong> ${customer.businessName}</p>
        <p><strong>Service:</strong> ${data.service}</p>
        <p><strong>Date:</strong> ${data.preferred_date}</p>
        <p><strong>Time:</strong> ${data.preferred_time}</p>
      `,
      attachments: [attachment],
    });

    /* PROVIDER EMAIL */
    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: customer.email.bookingNotifications,
      subject: "Appointment confirmed",
      html: `
        <h2>Appointment Confirmed</h2>
        <p><strong>Client:</strong> ${data.customer_email}</p>
        <p><strong>Service:</strong> ${data.service}</p>
        <p><strong>Date:</strong> ${data.preferred_date}</p>
        <p><strong>Time:</strong> ${data.preferred_time}</p>
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
