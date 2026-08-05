export const runtime = "nodejs";

import { verifyToken, signToken } from "@/app/lib/bookingTokens";
import { Resend } from "resend";
import type { CustomerConfig } from "@/app/lib/customerConfig";
import { getSupabase } from "@/app/lib/supabase";

const supabase = getSupabase();
const resend = new Resend(process.env.RESEND_API_KEY!);

type RescheduleActor = "provider" | "client";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ======================
   GET – Show reschedule form
====================== */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  const actor: RescheduleActor =
    url.searchParams.get("actor") === "client"
      ? "client"
      : "provider";

  if (!token) {
    return new Response("Invalid link", { status: 400 });
  }

  try {
    verifyToken(token);
  } catch {
    return new Response("Invalid or expired link", {
      status: 400,
    });
  }

  const safeToken = escapeHtml(token);

  const heading =
    actor === "provider"
      ? "Propose a new appointment time"
      : "Request a different appointment time";

  const description =
    actor === "provider"
      ? "Choose a new date and time to send to the client."
      : "Choose a new date and time to request from the business.";

  const buttonText =
    actor === "provider"
      ? "Send proposal to client"
      : "Send request to business";

  return new Response(
    `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />
          <title>${heading}</title>
        </head>

        <body
          style="
            margin:0;
            padding:40px 20px;
            background:#f5f5f5;
            font-family:Arial,sans-serif;
            color:#111827;
          "
        >
          <main
            style="
              max-width:480px;
              margin:0 auto;
              padding:28px;
              background:#ffffff;
              border-radius:16px;
              box-shadow:0 4px 16px rgba(0,0,0,0.08);
            "
          >
            <h2 style="margin-top:0;">${heading}</h2>

            <p style="color:#4b5563;">
              ${description}
            </p>

            <form method="POST">
              <label style="display:block;margin-top:20px;">
                <strong>Date</strong><br />

                <input
                  type="date"
                  name="date"
                  required
                  style="
                    width:100%;
                    box-sizing:border-box;
                    margin-top:8px;
                    padding:12px;
                    border:1px solid #d1d5db;
                    border-radius:8px;
                  "
                />
              </label>

              <label style="display:block;margin-top:20px;">
                <strong>Time</strong><br />

                <input
                  type="time"
                  name="time"
                  required
                  style="
                    width:100%;
                    box-sizing:border-box;
                    margin-top:8px;
                    padding:12px;
                    border:1px solid #d1d5db;
                    border-radius:8px;
                  "
                />
              </label>

              <input
                type="hidden"
                name="token"
                value="${safeToken}"
              />

              <input
                type="hidden"
                name="actor"
                value="${actor}"
              />

              <button
                type="submit"
                style="
                  width:100%;
                  margin-top:24px;
                  padding:12px 18px;
                  border:0;
                  border-radius:8px;
                  background:#4f46e5;
                  color:#ffffff;
                  font-weight:600;
                  cursor:pointer;
                "
              >
                ${buttonText}
              </button>
            </form>
          </main>
        </body>
      </html>
    `,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    }
  );
}

/* ======================
   POST – Send proposal
====================== */
export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const token = form.get("token")?.toString();
    const date = form.get("date")?.toString().trim();
    const time = form.get("time")?.toString().trim();

    const actor: RescheduleActor =
      form.get("actor")?.toString() === "client"
        ? "client"
        : "provider";

    if (!token || !date || !time) {
      return new Response("Invalid request", {
        status: 400,
      });
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !/^\d{2}:\d{2}$/.test(time)
    ) {
      return new Response("Invalid date or time", {
        status: 400,
      });
    }

    const data = verifyToken(token);

    if (
      !data.siteId ||
      !data.customer_email ||
      !data.service
    ) {
      return new Response("Invalid token", {
        status: 400,
      });
    }

    /* ======================
       Fetch business details
    ====================== */
    const { data: site, error: siteError } =
      await supabase
        .from("sites")
        .select("data")
        .eq("site_id", data.siteId)
        .single();

    if (siteError || !site) {
      console.error(
        "Reschedule site lookup error:",
        siteError
      );

      return new Response(
        "Business website not found",
        { status: 404 }
      );
    }

    const customer = site.data as CustomerConfig;

    const providerEmail =
      customer.email?.bookingNotifications?.trim();

    if (!providerEmail) {
      return new Response(
        "Provider email is not configured",
        { status: 400 }
      );
    }

    const clientEmail = String(
      data.customer_email
    ).trim();

    const businessReplyTo =
      customer.email?.replyTo?.trim() ||
      providerEmail;

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
       Safe display values
    ====================== */
    const safeBusinessName = escapeHtml(
      customer.businessName || "the business"
    );

    const safeClientEmail = escapeHtml(clientEmail);
    const safeService = escapeHtml(
      String(data.service)
    );

    const safeOriginalDate = escapeHtml(
      String(data.preferred_date || "")
    );

    const safeOriginalTime = escapeHtml(
      String(data.preferred_time || "")
    );

    const safeNewDate = escapeHtml(date);
    const safeNewTime = escapeHtml(time);

    const safeCustomerName = escapeHtml(
      String(data.customer_name ?? "")
        .trim()
        .slice(0, 100)
    );

    const safeCustomerMessage = escapeHtml(
      String(data.customer_message ?? "")
        .trim()
        .slice(0, 1000)
    ).replace(/\r?\n/g, "<br />");

    /* =====================================================
       BUSINESS PROPOSES NEW TIME TO CLIENT
    ===================================================== */
    if (actor === "provider") {
      const clientText = `
Appointment update from ${customer.businessName}

You are receiving this email because you requested an appointment with ${customer.businessName}.

Service: ${data.service}
Original date: ${data.preferred_date}
Original time: ${data.preferred_time}
Proposed new date: ${date}
Proposed new time: ${time}

Review and accept the proposed time:
${confirmUrl}

The appointment is not confirmed at the new time until you accept it.

If you did not request this appointment, you can ignore this email.
      `.trim();

      const { error: clientEmailError } =
        await resend.emails.send({
          from:
            "SimpleBookMe Bookings <booking@simplebookme.com>",

          to: clientEmail,
          replyTo: businessReplyTo,

          subject:
            `Appointment update from ` +
            `${customer.businessName} — ${date} at ${time}`,

          text: clientText,

          html: `
            <div
              style="
                max-width:600px;
                margin:0 auto;
                font-family:Arial,sans-serif;
                line-height:1.6;
                color:#111827;
              "
            >
              <h2>Appointment time update</h2>

              <p>
                You are receiving this email because you
                requested an appointment with
                <strong>${safeBusinessName}</strong>.
              </p>

              ${
                safeCustomerName
                  ? `
                    <p>
                      <strong>Name:</strong>
                      ${safeCustomerName}
                    </p>
                  `
                  : ""
              }

              <div
                style="
                  margin:20px 0;
                  padding:16px;
                  background:#f3f4f6;
                  border-radius:8px;
                "
              >
                <p style="margin:0 0 8px;">
                  <strong>Service:</strong>
                  ${safeService}
                </p>

                <p style="margin:0 0 8px;">
                  <strong>Original appointment:</strong>
                  ${safeOriginalDate}
                  at
                  ${safeOriginalTime}
                </p>

                <p style="margin:0;">
                  <strong>Proposed new appointment:</strong>
                  ${safeNewDate}
                  at
                  ${safeNewTime}
                </p>
              </div>

              ${
                safeCustomerMessage
                  ? `
                    <div
                      style="
                        margin:20px 0;
                        padding:16px;
                        background:#f9fafb;
                        border:1px solid #e5e7eb;
                        border-radius:8px;
                      "
                    >
                      <strong>Your original message:</strong>

                      <p style="margin-bottom:0;">
                        ${safeCustomerMessage}
                      </p>
                    </div>
                  `
                  : ""
              }

              <p>
                The business has proposed this new time
                for your appointment.
              </p>

              <p style="margin:24px 0;">
                <a
                  href="${confirmUrl}"
                  style="
                    display:inline-block;
                    padding:12px 18px;
                    background:#4f46e5;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:6px;
                    font-weight:600;
                  "
                >
                  Review and accept new time
                </a>
              </p>

              <p
                style="
                  font-size:13px;
                  color:#4b5563;
                "
              >
                The appointment is not confirmed at the
                new time until you accept it.
              </p>

              <p
                style="
                  font-size:12px;
                  color:#6b7280;
                "
              >
                If you did not request this appointment,
                you can ignore this email.
              </p>
            </div>
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

      const { error: providerEmailError } =
        await resend.emails.send({
          from:
            "SimpleBookMe Bookings <booking@simplebookme.com>",

          to: providerEmail,
          replyTo: clientEmail,

          subject:
            `Appointment proposal sent — ` +
            `${date} at ${time}`,

          text: `
Your proposed appointment time was sent to the client.

Client: ${clientEmail}
Service: ${data.service}
Original date: ${data.preferred_date}
Original time: ${data.preferred_time}
Proposed date: ${date}
Proposed time: ${time}

The client must accept the proposed time before it is confirmed.
          `.trim(),

          html: `
            <div
              style="
                max-width:600px;
                margin:0 auto;
                font-family:Arial,sans-serif;
                line-height:1.6;
                color:#111827;
              "
            >
              <h2>New time proposal sent</h2>

              <p>
                Your proposed appointment time has been
                sent to the client.
              </p>

              ${
                safeCustomerName
                  ? `
                    <p>
                      <strong>Client name:</strong>
                      ${safeCustomerName}
                    </p>
                  `
                  : ""
              }

              <p>
                <strong>Client email:</strong>
                ${safeClientEmail}
              </p>

              <p>
                <strong>Service:</strong>
                ${safeService}
              </p>

              <p>
                <strong>Original appointment:</strong>
                ${safeOriginalDate}
                at
                ${safeOriginalTime}
              </p>

              <p>
                <strong>Proposed appointment:</strong>
                ${safeNewDate}
                at
                ${safeNewTime}
              </p>

              <p>
                The client must accept the proposed time
                before it is confirmed.
              </p>
            </div>
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
        "The new appointment time was sent to the client.",
        { status: 200 }
      );
    }

    /* =====================================================
       CLIENT REQUESTS NEW TIME FROM BUSINESS
    ===================================================== */
    const providerText = `
A client requested a different appointment time.

Client: ${clientEmail}
Service: ${data.service}
Current date: ${data.preferred_date}
Current time: ${data.preferred_time}
Requested date: ${date}
Requested time: ${time}

Accept the requested time:
${confirmUrl}

The appointment will remain unchanged until you accept the request.
    `.trim();

    const { error: providerRequestError } =
      await resend.emails.send({
        from:
          "SimpleBookMe Bookings <booking@simplebookme.com>",

        to: providerEmail,
        replyTo: clientEmail,

        subject:
          `Client requested a new appointment time — ` +
          `${date} at ${time}`,

        text: providerText,

        html: `
          <div
            style="
              max-width:600px;
              margin:0 auto;
              font-family:Arial,sans-serif;
              line-height:1.6;
              color:#111827;
            "
          >
            <h2>Client requested a different time</h2>

            ${
              safeCustomerName
                ? `
                  <p>
                    <strong>Client name:</strong>
                    ${safeCustomerName}
                  </p>
                `
                : ""
            }

            <p>
              <strong>Client email:</strong>
              ${safeClientEmail}
            </p>

            <div
              style="
                margin:20px 0;
                padding:16px;
                background:#f3f4f6;
                border-radius:8px;
              "
            >
              <p style="margin:0 0 8px;">
                <strong>Service:</strong>
                ${safeService}
              </p>

              <p style="margin:0 0 8px;">
                <strong>Current appointment:</strong>
                ${safeOriginalDate}
                at
                ${safeOriginalTime}
              </p>

              <p style="margin:0;">
                <strong>Requested appointment:</strong>
                ${safeNewDate}
                at
                ${safeNewTime}
              </p>
            </div>

            ${
              safeCustomerMessage
                ? `
                  <div
                    style="
                      margin:20px 0;
                      padding:16px;
                      background:#f9fafb;
                      border:1px solid #e5e7eb;
                      border-radius:8px;
                    "
                  >
                    <strong>Client message:</strong>

                    <p style="margin-bottom:0;">
                      ${safeCustomerMessage}
                    </p>
                  </div>
                `
                : ""
            }

            <p style="margin:24px 0;">
              <a
                href="${confirmUrl}"
                style="
                  display:inline-block;
                  padding:12px 18px;
                  background:#16a34a;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:6px;
                  font-weight:600;
                "
              >
                Accept requested time
              </a>
            </p>

            <p
              style="
                font-size:13px;
                color:#4b5563;
              "
            >
              The appointment will remain unchanged until
              you accept the request.
            </p>
          </div>
        `,
      });

    if (providerRequestError) {
      console.error(
        "Client reschedule request email error:",
        providerRequestError
      );

      return new Response(
        `Could not email the business: ${providerRequestError.message}`,
        { status: 500 }
      );
    }

    const { error: clientCopyError } =
      await resend.emails.send({
        from:
          "SimpleBookMe Bookings <booking@simplebookme.com>",

        to: clientEmail,
        replyTo: businessReplyTo,

        subject:
          `Your appointment-change request was sent — ` +
          `${date} at ${time}`,

        text: `
Your appointment-change request was sent to ${customer.businessName}.

Service: ${data.service}
Current date: ${data.preferred_date}
Current time: ${data.preferred_time}
Requested date: ${date}
Requested time: ${time}

You will receive another email if the business accepts the requested time.
        `.trim(),

        html: `
          <div
            style="
              max-width:600px;
              margin:0 auto;
              font-family:Arial,sans-serif;
              line-height:1.6;
              color:#111827;
            "
          >
            <h2>Your request was sent</h2>

            <p>
              Your appointment-change request was sent to
              <strong>${safeBusinessName}</strong>.
            </p>

            <p>
              <strong>Service:</strong>
              ${safeService}
            </p>

            <p>
              <strong>Current appointment:</strong>
              ${safeOriginalDate}
              at
              ${safeOriginalTime}
            </p>

            <p>
              <strong>Requested appointment:</strong>
              ${safeNewDate}
              at
              ${safeNewTime}
            </p>

            <p>
              You will receive another email if the business
              accepts the requested time.
            </p>
          </div>
        `,
      });

    if (clientCopyError) {
      console.error(
        "Client reschedule copy error:",
        clientCopyError
      );

      return new Response(
        `The business received the request, but the client copy failed: ${clientCopyError.message}`,
        { status: 500 }
      );
    }

    return new Response(
      "Your appointment-change request was sent to the business.",
      { status: 200 }
    );
  } catch (err) {
    console.error("Reschedule error:", err);

    return new Response(
      err instanceof Error
        ? `Unable to process the request: ${err.message}`
        : "Invalid or expired link.",
      { status: 400 }
    );
  }
}