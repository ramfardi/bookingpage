export const runtime = "nodejs";

import type { CustomerConfig } from "@/app/lib/customerConfig";
import { Resend } from "resend";
import { signToken } from "@/app/lib/bookingTokens";
import crypto from "crypto";
import { getSupabase } from "@/app/lib/supabase";

import { createICS } from "@/app/lib/calendar";


const supabase = getSupabase();
const resend = new Resend(process.env.RESEND_API_KEY);

/* =====================
   Simple rate limiter
===================== */
const rateLimit = new Map<string, { count: number; ts: number }>();

function isRateLimited(ip: string, limit = 3, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record) {
    rateLimit.set(ip, { count: 1, ts: now });
    return false;
  }

  if (now - record.ts > windowMs) {
    rateLimit.set(ip, { count: 1, ts: now });
    return false;
  }

  record.count += 1;
  return record.count > limit;
}


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      customerKey, // siteId
      service,
      preferred_date,
      preferred_time,
      customer_email,
      company,
    } = body;

    if (company) return Response.json({ success: true });

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    if (isRateLimited(ip)) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    if (!customerKey || !service || !preferred_date || !preferred_time || !customer_email) {
      return Response.json({ error: "Invalid booking request" }, { status: 400 });
    }

    const { data: site, error } = await supabase
      .from("sites")
      .select("data")
      .eq("site_id", customerKey)
      .single();

    if (error || !site) {
      return Response.json({ error: "Site not found" }, { status: 404 });
    }

    const customer = site.data as CustomerConfig;

    if (!customer.email?.bookingNotifications) {
      return Response.json(
        { error: "Booking email not configured" },
        { status: 400 }
      );
    }

    const providerEmail = customer.email.bookingNotifications;

    const eventUID = `booking-${crypto
      .createHash("sha1")
      .update(`${customerKey}-${customer_email}-${preferred_date}-${preferred_time}`)
      .digest("hex")}`;

    const token = signToken({
      siteId: customerKey,
      service,
      preferred_date,
      preferred_time,
      customer_email,
      eventUID,
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "https://simplebookme.com";

    const confirmUrl =
      `${baseUrl}/api/booking/confirm?token=${encodeURIComponent(token)}`;

    const rescheduleUrl =
      `${baseUrl}/api/booking/reschedule?token=${encodeURIComponent(token)}`;


    /* =====================
       PROVIDER EMAIL (CONFIRM + MODIFY)
    ===================== */
	await resend.emails.send({
	  from: "Booking <booking@simplebookme.com>",
	  to: customer_email,
	  replyTo: customer.email.replyTo ?? providerEmail,
	  subject: `Booking request received – ${customer.businessName}`,
	  html: `
		<h2>Booking request received</h2>
		<p>Your request has been sent to <strong>${customer.businessName}</strong>.</p>
		<p><strong>Service:</strong> ${service}</p>
		<p><strong>Date:</strong> ${preferred_date}</p>
		<p><strong>Time:</strong> ${preferred_time}</p>
		<p>You will receive a confirmation email and calendar invitation once the provider approves it.</p>
	  `,
	});

    /* =====================
       CLIENT EMAIL (NO CONFIRM)
    ===================== */
    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: customer_email,
      replyTo: customer.email.replyTo ?? providerEmail,
      subject: `Booking request received – ${customer.businessName}`,
      html: `
        <h2>Booking request received</h2>
        <p>Your request has been sent to <strong>${customer.businessName}</strong>.</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${preferred_date}</p>
        <p><strong>Time:</strong> ${preferred_time}</p>
        <p>You will receive a confirmation once the provider approves it.</p>
      `,
      attachments: [calendarAttachment],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Send booking error:", err);
    return Response.json({ error: "Failed to send booking" }, { status: 500 });
  }
}
