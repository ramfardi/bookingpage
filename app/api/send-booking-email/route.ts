export const runtime = "nodejs";
import type { CustomerConfig } from "@/app/lib/customerConfig";

import { Resend } from "resend";
import { signToken } from "@/app/lib/bookingTokens";
import crypto from "crypto";
import { getSupabase } from "@/app/lib/supabase";
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

/* =====================
   Calendar (.ics)
===================== */
function createICS(
  uid: string,
  title: string,
  description: string,
  start: Date
) {
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const format = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SimpleBookMe//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${format(new Date())}
DTSTART:${format(start)}
DTEND:${format(end)}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR
`.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      customerKey,
      service,
      preferred_date,
      preferred_time,
      customer_email,
      company, // honeypot
    } = body;

    /* Honeypot */
    if (company) {
      return Response.json({ success: true });
    }

    /* Rate limit */
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    if (isRateLimited(ip)) {
      return Response.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    if (
      !customerKey ||
      !service ||
      !preferred_date ||
      !preferred_time ||
      !customer_email
    ) {
      return Response.json(
        { error: "Invalid booking request" },
        { status: 400 }
      );
    }

    // Fetch site config from Supabase
	const { data: site, error } = await supabase
	  .from("sites")
	  .select("data")
	  .eq("site_id", customerKey)
	  .single();

	if (error || !site) {
	  return Response.json(
		{ error: "Site not found" },
		{ status: 404 }
	  );
	}

const customer = site.data as CustomerConfig;


    if (!customer?.email?.bookingNotifications) {
      return Response.json(
        { error: "Booking email not configured" },
        { status: 400 }
      );
    }

    const providerEmail = customer.email.bookingNotifications;

    /* =====================
       Stable event UID
    ===================== */
    const startDate = new Date(`${preferred_date}T${preferred_time}`);

    const eventUID = `booking-${crypto
      .createHash("sha1")
      .update(
        `${customerKey}-${customer_email}-${preferred_date}-${preferred_time}`
      )
      .digest("hex")}`;

    /* =====================
       Sign booking token
    ===================== */
    const token = signToken({
      customerKey,
      service,
      preferred_date,
      preferred_time,
      customer_email,
      eventUID,
    });

    const confirmUrl =
      `https://simplebookme.com/api/booking/confirm?token=${encodeURIComponent(token)}`;

    const rescheduleUrl =
      `https://simplebookme.com/api/booking/reschedule?token=${token}`;

    /* =====================
       Calendar attachment
    ===================== */
    const ics = createICS(
      eventUID,
      `Booking with ${customer.businessName}`,
      `Service: ${service}`,
      startDate
    );

    const calendarAttachment = {
      filename: "booking.ics",
      content: Buffer.from(ics).toString("base64"),
    };

    /* =====================
       PROVIDER EMAIL
    ===================== */
    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: providerEmail,
      subject: "New booking request",
      html: `
        <h2>New booking request</h2>

        <p><strong>Client:</strong> ${customer_email}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${preferred_date}</p>
        <p><strong>Time:</strong> ${preferred_time}</p>

        <p>
          <a href="${confirmUrl}"
             style="margin-right:10px;
                    display:inline-block;padding:10px 14px;
                    background:#16a34a;color:white;
                    text-decoration:none;border-radius:6px;">
            Confirm
          </a>

          <a href="${rescheduleUrl}"
             style="display:inline-block;padding:10px 14px;
                    background:#f59e0b;color:white;
                    text-decoration:none;border-radius:6px;">
            Modify time
          </a>
        </p>
      `,
    });

    /* =====================
       CUSTOMER EMAIL
    ===================== */
    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: customer_email,
      replyTo:
        customer.email.replyTo ?? providerEmail,
      subject: `Confirm your booking – ${customer.businessName}`,
      html: `
        <h2>Confirm your booking</h2>

        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${preferred_date}</p>
        <p><strong>Time:</strong> ${preferred_time}</p>

        <p>
          <a href="${confirmUrl}"
             style="display:inline-block;padding:12px 18px;
                    background:#4f46e5;color:white;
                    text-decoration:none;border-radius:6px;">
            Confirm appointment
          </a>
        </p>

        <p style="margin-top:16px;font-size:12px;color:#666;">
          If you didn’t request this booking, you can ignore this email.
        </p>
      `,
      attachments: [calendarAttachment],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Send booking error:", err);
    return Response.json(
      { error: "Failed to send booking" },
      { status: 500 }
    );
  }
}
