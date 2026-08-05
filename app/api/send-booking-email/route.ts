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

function isRateLimited(
  ip: string,
  limit = 3,
  windowMs = 10 * 60 * 1000
) {
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
   HTML safety
===================== */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
      customer_name,
      customer_message,
      company,
    } = body;

    // Honeypot
    if (company) {
      return Response.json({ success: true });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (isRateLimited(ip)) {
      return Response.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const clientEmail = String(customer_email ?? "").trim();
    const cleanService = String(service ?? "").trim();
    const cleanDate = String(preferred_date ?? "").trim();
    const cleanTime = String(preferred_time ?? "").trim();

    const cleanCustomerName = String(customer_name ?? "")
      .trim()
      .slice(0, 100);

    const cleanCustomerMessage = String(customer_message ?? "")
      .trim()
      .slice(0, 1000);

    if (
      !customerKey ||
      !cleanService ||
      !cleanDate ||
      !cleanTime ||
      !clientEmail
    ) {
      return Response.json(
        { error: "Invalid booking request" },
        { status: 400 }
      );
    }

    const emailIsValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail);

    if (!emailIsValid) {
      return Response.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

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

    if (!customer.email?.bookingNotifications) {
      return Response.json(
        { error: "Booking email not configured" },
        { status: 400 }
      );
    }

    const providerEmail =
      customer.email.bookingNotifications.trim();

    const eventUID = `booking-${crypto
      .createHash("sha1")
      .update(
        `${customerKey}-${clientEmail}-${cleanDate}-${cleanTime}`
      )
      .digest("hex")}`;

    /*
     * Store the optional name and message in the signed token.
     * This allows the confirmation and rescheduling routes to
     * preserve them.
     */
    const token = signToken({
      siteId: customerKey,
      service: cleanService,
      preferred_date: cleanDate,
      preferred_time: cleanTime,
      customer_email: clientEmail,
      customer_name: cleanCustomerName,
      customer_message: cleanCustomerMessage,
      eventUID,
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      "https://simplebookme.com";

    const confirmUrl =
      `${baseUrl}/api/booking/confirm?token=${encodeURIComponent(
        token
      )}`;

    const rescheduleUrl =
      `${baseUrl}/api/booking/reschedule?token=${encodeURIComponent(
        token
      )}`;

    /*
     * Escaped values used only inside HTML emails.
     */
    const safeBusinessName = escapeHtml(
      customer.businessName || "the business"
    );

    const safeClientEmail = escapeHtml(clientEmail);
    const safeService = escapeHtml(cleanService);
    const safeDate = escapeHtml(cleanDate);
    const safeTime = escapeHtml(cleanTime);
    const safeCustomerName = escapeHtml(cleanCustomerName);

    const safeCustomerMessage = escapeHtml(
      cleanCustomerMessage
    ).replace(/\r?\n/g, "<br />");

    /* =====================
       Provider email
    ===================== */
    const { error: providerEmailError } =
      await resend.emails.send({
        from: "Booking <booking@simplebookme.com>",
        to: providerEmail,

        // Replying to this email replies to the person booking.
        replyTo: clientEmail,

        subject: "New booking request",

        html: `
          <h2>New booking request</h2>

          ${
            safeCustomerName
              ? `<p><strong>Client name:</strong> ${safeCustomerName}</p>`
              : ""
          }

          <p><strong>Client email:</strong> ${safeClientEmail}</p>
          <p><strong>Service:</strong> ${safeService}</p>
          <p><strong>Date:</strong> ${safeDate}</p>
          <p><strong>Time:</strong> ${safeTime}</p>

          ${
            safeCustomerMessage
              ? `
                <div
                  style="
                    margin-top:16px;
                    padding:14px;
                    background:#f3f4f6;
                    border-radius:8px;
                  "
                >
                  <strong>Questions or special requests:</strong>

                  <p style="margin-bottom:0;">
                    ${safeCustomerMessage}
                  </p>
                </div>
              `
              : ""
          }

          <p style="margin-top:20px;">
            <a
              href="${confirmUrl}"
              style="
                display:inline-block;
                margin-right:8px;
                padding:10px 14px;
                background:#16a34a;
                color:white;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Confirm
            </a>

            <a
              href="${rescheduleUrl}"
              style="
                display:inline-block;
                padding:10px 14px;
                background:#f59e0b;
                color:white;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Modify time
            </a>
          </p>
        `,
      });

    if (providerEmailError) {
      console.error(
        "Provider booking email error:",
        providerEmailError
      );

      return Response.json(
        {
          error:
            "The booking request could not be emailed to the business.",
          details: providerEmailError.message,
        },
        { status: 500 }
      );
    }

    /* =====================
       Client email
       No calendar before confirmation
    ===================== */
    const { error: clientEmailError } =
      await resend.emails.send({
        from: "Booking <booking@simplebookme.com>",
        to: clientEmail,
        replyTo:
          customer.email.replyTo?.trim() || providerEmail,

        subject: `Booking request received – ${customer.businessName}`,

        html: `
          <h2>Booking request received</h2>

          <p>
            Your request has been sent to
            <strong>${safeBusinessName}</strong>.
          </p>

          ${
            safeCustomerName
              ? `<p><strong>Name:</strong> ${safeCustomerName}</p>`
              : ""
          }

          <p><strong>Service:</strong> ${safeService}</p>
          <p><strong>Date:</strong> ${safeDate}</p>
          <p><strong>Time:</strong> ${safeTime}</p>

          ${
            safeCustomerMessage
              ? `
                <div
                  style="
                    margin-top:16px;
                    padding:14px;
                    background:#f3f4f6;
                    border-radius:8px;
                  "
                >
                  <strong>Your message:</strong>

                  <p style="margin-bottom:0;">
                    ${safeCustomerMessage}
                  </p>
                </div>
              `
              : ""
          }

          <p>
            You will receive a confirmation email and calendar
            invitation once the provider approves the appointment.
          </p>
        `,
      });

    if (clientEmailError) {
      console.error(
        "Client booking email error:",
        clientEmailError
      );

      return Response.json(
        {
          error:
            "The business was notified, but the client email could not be sent.",
          details: clientEmailError.message,
        },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Send booking error:", err);

    return Response.json(
      { error: "Failed to send booking" },
      { status: 500 }
    );
  }
}