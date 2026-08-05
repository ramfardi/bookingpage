export const runtime = "nodejs";

import type { CustomerConfig } from "@/app/lib/customerConfig";
import { verifyToken } from "@/app/lib/bookingTokens";
import { createICS } from "@/app/lib/calendar";
import { Resend } from "resend";
import { getSupabase } from "@/app/lib/supabase";

const supabase = getSupabase();
const resend = new Resend(process.env.RESEND_API_KEY!);

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
      customer_name,
      customer_message,
      eventUID,
    } = data;

    if (
      !siteId ||
      !service ||
      !preferred_date ||
      !preferred_time ||
      !customer_email ||
      !eventUID
    ) {
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
    const providerEmail =
      customer.email?.bookingNotifications?.trim();

    if (!providerEmail) {
      return new Response(
        "Provider email not configured",
        { status: 400 }
      );
    }

    /* =====================
       Clean and escape values
    ===================== */
    const cleanCustomerName = String(customer_name ?? "")
      .trim()
      .slice(0, 100);

    const cleanCustomerMessage = String(customer_message ?? "")
      .trim()
      .slice(0, 1000);

    const safeBusinessName = escapeHtml(
      customer.businessName || "the business"
    );

    const safeCustomerEmail = escapeHtml(
      String(customer_email)
    );

    const safeCustomerName = escapeHtml(cleanCustomerName);

    const safeCustomerMessage = escapeHtml(
      cleanCustomerMessage
    ).replace(/\r?\n/g, "<br />");

    const safeService = escapeHtml(String(service));
    const safeDate = escapeHtml(String(preferred_date));
    const safeTime = escapeHtml(String(preferred_time));

    /* =====================
       Calendar (.ics)
    ===================== */
    const ics = createICS({
      uid: eventUID,
      title: `Booking with ${customer.businessName}`,
      description: `Service: ${service}`,
      date: preferred_date,
      time: preferred_time,
    });

    const attachment = {
      filename: "booking.ics",
      content: Buffer.from(ics).toString("base64"),
    };

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      "https://simplebookme.com";

    const rescheduleUrl =
      `${baseUrl}/api/booking/reschedule?token=${encodeURIComponent(
        token
      )}`;

    /* =====================
       Email → client
    ===================== */
    const { error: clientEmailError } =
      await resend.emails.send({
        from: "Booking <booking@simplebookme.com>",
        to: customer_email,
        replyTo:
          customer.email?.replyTo?.trim() || providerEmail,
        subject: `Your appointment is confirmed – ${customer.businessName}`,
        html: `
          <h2>Appointment confirmed</h2>

          <p><strong>Business:</strong> ${safeBusinessName}</p>

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

          <p style="margin-top:20px;">
            If you need to change the appointment time, you can
            request a modification:
          </p>

          <p>
            <a
              href="${rescheduleUrl}"
              style="
                display:inline-block;
                padding:12px 18px;
                background:#f59e0b;
                color:white;
                text-decoration:none;
                border-radius:6px;
                font-weight:600;
              "
            >
              Modify appointment
            </a>
          </p>

          <p style="margin-top:16px;font-size:12px;color:#666;">
            A modification request will be sent to the business
            for approval.
          </p>
        `,
        attachments: [attachment],
      });

    if (clientEmailError) {
      console.error(
        "Confirmed client email error:",
        clientEmailError
      );

      return new Response(
        `Could not send the client confirmation: ${clientEmailError.message}`,
        { status: 500 }
      );
    }

    /* =====================
       Email → provider
    ===================== */
    const { error: providerEmailError } =
      await resend.emails.send({
        from: "Booking <booking@simplebookme.com>",
        to: providerEmail,
        replyTo: customer_email,
        subject: `Appointment confirmed – ${service} – ${preferred_date}`,
        html: `
          <h2>Appointment confirmed</h2>

          ${
            safeCustomerName
              ? `<p><strong>Client name:</strong> ${safeCustomerName}</p>`
              : ""
          }

          <p>
            <strong>Client email:</strong>
            ${safeCustomerEmail}
          </p>

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
        `,
        attachments: [attachment],
      });

    if (providerEmailError) {
      console.error(
        "Confirmed provider email error:",
        providerEmailError
      );

      return new Response(
        `The client was confirmed, but the business email failed: ${providerEmailError.message}`,
        { status: 500 }
      );
    }

    return new Response(
      "Appointment confirmed. You may close this tab.",
      { status: 200 }
    );
  } catch (err) {
    console.error("Confirm booking error:", err);

    return new Response(
      "Invalid or expired link.",
      { status: 400 }
    );
  }
}