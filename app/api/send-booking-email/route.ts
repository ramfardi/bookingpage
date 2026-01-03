import { Resend } from "resend";
import { CUSTOMER_CONFIG } from "@/app/lib/customerConfig";
import crypto from "crypto";

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

    const customer = CUSTOMER_CONFIG[customerKey];

    if (!customer?.email?.bookingNotifications) {
      return Response.json(
        { error: "Booking email not configured" },
        { status: 400 }
      );
    }

    /* =====================
       Create calendar once
    ===================== */
    const startDate = new Date(`${preferred_date}T${preferred_time}`);

    // Stable UID so future updates replace the event
    const eventUID = `booking-${crypto
      .createHash("sha1")
      .update(
        `${customerKey}-${customer_email}-${preferred_date}-${preferred_time}`
      )
      .digest("hex")}`;

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
      to: customer.email.bookingNotifications,
      replyTo: customer_email,
      subject: `New booking – ${customer.businessName}`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${preferred_date}</p>
        <p><strong>Time:</strong> ${preferred_time}</p>
        <p><strong>Client email:</strong> ${customer_email}</p>
      `,
      attachments: [calendarAttachment],
    });

    /* =====================
       CUSTOMER CONFIRMATION
    ===================== */
    await resend.emails.send({
      from: "Booking <booking@simplebookme.com>",
      to: customer_email,
      replyTo:
        customer.email.replyTo ??
        customer.email.bookingNotifications,
      subject: `Your booking request – ${customer.businessName}`,
      html: `
        <h2>Booking Request Received</h2>
        <p>Your request has been sent to <strong>${customer.businessName}</strong>.</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${preferred_date}</p>
        <p><strong>Time:</strong> ${preferred_time}</p>
        <p>The calendar invite is attached.</p>
      `,
      attachments: [calendarAttachment],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Failed to send booking" },
      { status: 500 }
    );
  }
}
