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

type EmailQuotaReservation = {
  allowed: boolean;
  duplicate: boolean;
  batchId?: string;
  status?: "reserved" | "sent" | "partial" | "failed";
  used?: number;
  limit?: number;
  remaining?: number;
  required?: number;
  unitsReserved?: number;
  unitsSent?: number;
  periodStartedAt?: string;
  periodEndsAt?: string;
};

type RescheduleEmailPayload = {
  from: string;
  to: string | string[];
  replyTo?: string | string[];
  subject: string;
  text: string;
  html: string;
};

type PublicBusinessContact = {
  businessName: string | null;
  phone: string | null;
  email: string | null;
};

type EmailPairResult = {
  firstSent: boolean;
  secondSent: boolean;
  quotaFinalized: boolean;
  errorMessage: string | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function createMessageResponse({
  title,
  message,
  status = 200,
  detail,
  contact,
}: {
  title: string;
  message: string;
  status?: number;
  detail?: string;
  contact?: PublicBusinessContact;
}) {
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const safeDetail = detail ? escapeHtml(detail) : "";

  const safeBusinessName = contact?.businessName
    ? escapeHtml(contact.businessName)
    : "";

  const safePhone = contact?.phone
    ? escapeHtml(contact.phone)
    : "";

  const phoneHref = contact?.phone
    ? contact.phone.replace(/[^\d+]/g, "")
    : "";

  const safeEmail = contact?.email
    ? escapeHtml(contact.email)
    : "";

  const contactHtml =
    contact &&
    (contact.businessName || contact.phone || contact.email)
      ? `
        <div
          style="
            margin-top:20px;
            padding:16px;
            background:#f9fafb;
            border:1px solid #e5e7eb;
            border-radius:10px;
          "
        >
          ${
            safeBusinessName
              ? `
                <p style="margin:0 0 12px;font-weight:700;">
                  ${safeBusinessName}
                </p>
              `
              : ""
          }

          ${
            safePhone
              ? `
                <p style="margin:8px 0;">
                  <a
                    href="tel:${phoneHref}"
                    style="
                      color:#4f46e5;
                      font-weight:600;
                      text-decoration:none;
                    "
                  >
                    Call ${safePhone}
                  </a>
                </p>
              `
              : ""
          }

          ${
            safeEmail
              ? `
                <p style="margin:8px 0;">
                  <a
                    href="mailto:${safeEmail}"
                    style="
                      color:#4f46e5;
                      font-weight:600;
                      text-decoration:none;
                    "
                  >
                    Email ${safeEmail}
                  </a>
                </p>
              `
              : ""
          }
        </div>
      `
      : "";

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

          <title>${safeTitle}</title>
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
              max-width:560px;
              margin:0 auto;
              padding:30px;
              background:#ffffff;
              border-radius:16px;
              box-shadow:0 4px 16px rgba(0,0,0,0.08);
            "
          >
            <h1
              style="
                margin-top:0;
                font-size:24px;
              "
            >
              ${safeTitle}
            </h1>

            <p
              style="
                margin-bottom:0;
                line-height:1.7;
                color:#4b5563;
              "
            >
              ${safeMessage}
            </p>

            ${
              safeDetail
                ? `
                  <p
                    style="
                      margin-top:18px;
                      padding:14px;
                      background:#f3f4f6;
                      border-radius:8px;
                      line-height:1.6;
                    "
                  >
                    ${safeDetail}
                  </p>
                `
                : ""
            }

            ${contactHtml}
          </main>
        </body>
      </html>
    `,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    }
  );
}

async function finalizeEmailBatch({
  batchId,
  unitsSent,
  resendEmailIds,
  errorMessage,
}: {
  batchId: string;
  unitsSent: number;
  resendEmailIds: string[];
  errorMessage: string | null;
}) {
  const { error } = await supabase.rpc(
    "finalize_site_email_batch",
    {
      p_batch_id: batchId,
      p_units_sent: unitsSent,
      p_resend_email_ids: resendEmailIds,
      p_error_message: errorMessage,
    }
  );

  if (error) {
    console.error(
      "Failed to finalize reschedule email quota:",
      error
    );

    return false;
  }

  return true;
}

async function sendOneEmail({
  email,
  idempotencyKey,
}: {
  email: RescheduleEmailPayload;
  idempotencyKey: string;
}) {
  try {
    const { data, error } = await resend.emails.send(
      email,
      {
        idempotencyKey:
          idempotencyKey.slice(0, 256),
      }
    );

    if (error) {
      return {
        sent: false as const,
        id: null,
        errorMessage: error.message,
      };
    }

    if (!data?.id) {
      return {
        sent: false as const,
        id: null,
        errorMessage:
          "Resend did not return an email ID.",
      };
    }

    return {
      sent: true as const,
      id: data.id,
      errorMessage: null,
    };
  } catch (error) {
    return {
      sent: false as const,
      id: null,
      errorMessage: getErrorMessage(error),
    };
  }
}

async function sendReservedEmailPair({
  batchId,
  firstEmail,
  secondEmail,
  firstIdempotencyKey,
  secondIdempotencyKey,
}: {
  batchId: string;
  firstEmail: RescheduleEmailPayload;
  secondEmail: RescheduleEmailPayload;
  firstIdempotencyKey: string;
  secondIdempotencyKey: string;
}): Promise<EmailPairResult> {
  const resendEmailIds: string[] = [];

  const firstResult = await sendOneEmail({
    email: firstEmail,
    idempotencyKey: firstIdempotencyKey,
  });

  if (!firstResult.sent) {
    const quotaFinalized =
      await finalizeEmailBatch({
        batchId,
        unitsSent: 0,
        resendEmailIds: [],
        errorMessage:
          firstResult.errorMessage,
      });

    return {
      firstSent: false,
      secondSent: false,
      quotaFinalized,
      errorMessage:
        firstResult.errorMessage,
    };
  }

  resendEmailIds.push(firstResult.id);

  const secondResult = await sendOneEmail({
    email: secondEmail,
    idempotencyKey: secondIdempotencyKey,
  });

  if (!secondResult.sent) {
    const quotaFinalized =
      await finalizeEmailBatch({
        batchId,
        unitsSent: 1,
        resendEmailIds,
        errorMessage:
          secondResult.errorMessage,
      });

    return {
      firstSent: true,
      secondSent: false,
      quotaFinalized,
      errorMessage:
        secondResult.errorMessage,
    };
  }

  resendEmailIds.push(secondResult.id);

  const quotaFinalized =
    await finalizeEmailBatch({
      batchId,
      unitsSent: 2,
      resendEmailIds,
      errorMessage: null,
    });

  return {
    firstSent: true,
    secondSent: true,
    quotaFinalized,
    errorMessage: null,
  };
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

<form
  method="POST"
  id="rescheduleForm"
>
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
  name="appointment_at"
  id="appointment_at"
/>
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
			<script>
  const rescheduleForm =
    document.getElementById(
      "rescheduleForm"
    );

  rescheduleForm.addEventListener(
    "submit",
    function (event) {
      const dateInput =
        rescheduleForm.querySelector(
          '[name="date"]'
        );

      const timeInput =
        rescheduleForm.querySelector(
          '[name="time"]'
        );

      const appointmentAtInput =
        document.getElementById(
          "appointment_at"
        );

      const date =
        dateInput.value;

      const time =
        timeInput.value;

      /*
       * The browser interprets this as local time.
       *
       * Example:
       * 2026-08-20 at 14:00
       *
       * in Vancouver becomes an absolute UTC timestamp.
       *
       * This is invisible to the user.
       */
      const localAppointment =
        new Date(
          date +
          "T" +
          time +
          ":00"
        );

      if (
        Number.isNaN(
          localAppointment.getTime()
        )
      ) {
        event.preventDefault();

        alert(
          "Please choose a valid date and time."
        );

        return;
      }

      appointmentAtInput.value =
        localAppointment.toISOString();
    }
  );
</script>
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

const token =
  form.get("token")?.toString();

const date =
  form.get("date")?.toString().trim();

const time =
  form.get("time")?.toString().trim();

const appointmentAtRaw =
  form
    .get("appointment_at")
    ?.toString()
    .trim();

    const actor: RescheduleActor =
      form.get("actor")?.toString() === "client"
        ? "client"
        : "provider";

if (
  !token ||
  !date ||
  !time ||
  !appointmentAtRaw
) {
  return createMessageResponse({
    title: "Invalid request",

    message:
      "The appointment-change request is incomplete.",

    status: 400,
  });
}

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !/^\d{2}:\d{2}$/.test(time)
    ) {
      return createMessageResponse({
        title: "Invalid date or time",
        message:
          "Please choose a valid appointment date and time.",
        status: 400,
      });
    }

const parsedAppointmentAt =
  new Date(
    appointmentAtRaw
  );

if (
  Number.isNaN(
    parsedAppointmentAt.getTime()
  )
) {
  return createMessageResponse({
    title:
      "Invalid appointment time",

    message:
      "Please choose a valid appointment date and time.",

    status: 400,
  });
}

    let data;

    try {
      data = verifyToken(token);
    } catch {
      return createMessageResponse({
        title: "Invalid or expired link",
        message:
          "This appointment-change link is invalid or has expired.",
        status: 400,
      });
    }

    const cleanSiteId =
      String(data.siteId ?? "").trim();

    const clientEmail =
      String(data.customer_email ?? "").trim();

    const cleanService =
      String(data.service ?? "")
        .trim()
        .slice(0, 200);

    const originalDate =
      String(data.preferred_date ?? "").trim();

    const originalTime =
      String(data.preferred_time ?? "").trim();

    const eventUID =
      String(data.eventUID ?? "").trim();

    if (
      !cleanSiteId ||
      !clientEmail ||
      !cleanService ||
      !originalDate ||
      !originalTime ||
      !eventUID
    ) {
      return createMessageResponse({
        title: "Invalid appointment link",
        message:
          "The appointment information in this link is incomplete.",
        status: 400,
      });
    }

    const clientEmailIsValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        clientEmail
      );

    if (!clientEmailIsValid) {
      return createMessageResponse({
        title: "Invalid client email",
        message:
          "The appointment contains an invalid client email address.",
        status: 400,
      });
    }

    /* ======================
       Fetch business details
    ====================== */

    const {
      data: site,
      error: siteError,
    } = await supabase
      .from("sites")
      .select("data")
      .eq("site_id", cleanSiteId)
      .single();

    if (siteError || !site) {
      console.error(
        "Reschedule site lookup error:",
        siteError
      );

      return createMessageResponse({
        title: "Business website not found",
        message:
          "The business website associated with this appointment could not be found.",
        status: 404,
      });
    }

    const customer =
      site.data as CustomerConfig;

    const providerEmail =
      customer.email?.bookingNotifications?.trim();

    if (!providerEmail) {
      return createMessageResponse({
        title: "Business email unavailable",
        message:
          "The business has not configured an appointment notification email.",
        status: 400,
      });
    }

    const providerEmailIsValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        providerEmail
      );

    if (!providerEmailIsValid) {
      return createMessageResponse({
        title: "Invalid business email",
        message:
          "The business appointment email is invalid.",
        status: 400,
      });
    }

    const businessReplyTo =
      customer.email?.replyTo?.trim() ||
      providerEmail;

    const publicBusinessContact:
      PublicBusinessContact = {
        businessName:
          customer.businessName || null,

        phone:
          customer.contact?.phone?.trim() ||
          null,

        email:
          customer.contact?.email?.trim() ||
          null,
      };

    /* ======================
       Create updated token
    ====================== */

const newToken = signToken({
  ...data,

  preferred_date:
    date,

  preferred_time:
    time,

  appointment_at:
    parsedAppointmentAt
      .toISOString(),
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
      customer.businessName ||
        "the business"
    );

    const safeClientEmail =
      escapeHtml(clientEmail);

    const safeService =
      escapeHtml(cleanService);

    const safeOriginalDate =
      escapeHtml(originalDate);

    const safeOriginalTime =
      escapeHtml(originalTime);

    const safeNewDate =
      escapeHtml(date);

    const safeNewTime =
      escapeHtml(time);

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

    /*
     * Both reschedule flows send two emails:
     *
     * Provider flow:
     * 1. Proposal to client
     * 2. Copy to provider
     *
     * Client flow:
     * 1. Request to provider
     * 2. Copy to client
     */
    const requiredEmailUnits = 2;

    const reservationKey = [
      "booking-reschedule",
      actor,
      eventUID,
      originalDate,
      originalTime,
      date,
      time,
    ]
      .join("/")
      .slice(0, 256);

    /* ======================
       Reserve quota
    ====================== */

    const {
      data: quotaData,
      error: quotaError,
    } = await supabase.rpc(
      "reserve_site_email_batch",
      {
        p_site_id: cleanSiteId,
        p_units: requiredEmailUnits,
        p_email_type:
          "booking_reschedule",
        p_idempotency_key:
          reservationKey,
      }
    );

    if (quotaError) {
      console.error(
        "Reschedule quota error:",
        quotaError
      );

      if (actor === "provider") {
        return createMessageResponse({
          title:
            "Email service temporarily unavailable",

          message:
            "The proposed appointment time could not be emailed. Please contact the client directly.",

          status: 503,

          detail:
            `Client email: ${clientEmail}`,
        });
      }

      return createMessageResponse({
        title:
          "Email service temporarily unavailable",

        message:
          "Your appointment-change request could not be emailed. Please contact the business directly.",

        status: 503,

        contact:
          publicBusinessContact,
      });
    }

    const quota =
      quotaData as EmailQuotaReservation;

    /* ======================
       Duplicate submission
    ====================== */

    if (quota.duplicate) {
      if (quota.status === "sent") {
        return createMessageResponse({
          title:
            actor === "provider"
              ? "Proposal already sent"
              : "Request already sent",

          message:
            actor === "provider"
              ? "This proposed appointment time was already sent to the client."
              : "This appointment-change request was already sent to the business.",

          status: 200,
        });
      }

      if (quota.status === "partial") {
        return createMessageResponse({
          title:
            actor === "provider"
              ? "Proposal already sent"
              : "Request already sent",

          message:
            actor === "provider"
              ? "The proposed time was already sent to the client, but the business copy could not be delivered."
              : "The business already received your appointment-change request, but your confirmation copy could not be delivered.",

          status: 200,
        });
      }

      return createMessageResponse({
        title:
          "Request already processing",

        message:
          "This appointment-change request is already being processed. Please wait before trying again.",

        status: 409,
      });
    }

    /* ======================
       Monthly quota reached
    ====================== */

    if (!quota.allowed) {
      console.warn(
        "Reschedule quota reached:",
        {
          siteId: cleanSiteId,
          actor,
          used: quota.used,
          limit: quota.limit,
          remaining:
            quota.remaining,
          required:
            quota.required,
          periodEndsAt:
            quota.periodEndsAt,
        }
      );

      if (actor === "provider") {
        return createMessageResponse({
          title:
            "Monthly email limit reached",

          message:
            "The proposed appointment time was not emailed. Please contact the client directly.",

          status: 409,

          detail:
            `Client email: ${clientEmail}`,
        });
      }

      return createMessageResponse({
        title:
          "Monthly email limit reached",

        message:
          "Your appointment-change request was not emailed. Please contact the business directly.",

        status: 409,

        contact:
          publicBusinessContact,
      });
    }

    if (!quota.batchId) {
      console.error(
        "Reschedule quota reservation has no batch ID:",
        quota
      );

      return createMessageResponse({
        title:
          "Request could not be processed",

        message:
          "The appointment-change request could not be processed. Please contact the other party directly.",

        status: 500,
      });
    }

    const batchId =
      quota.batchId;

    const firstIdempotencyKey =
      `${reservationKey}/first`;

    const secondIdempotencyKey =
      `${reservationKey}/second`;

    /* =====================================================
       BUSINESS PROPOSES NEW TIME TO CLIENT
    ===================================================== */

    if (actor === "provider") {
      const clientText = `
Appointment update from ${customer.businessName}

You are receiving this email because you requested an appointment with ${customer.businessName}.

Service: ${cleanService}
Original date: ${originalDate}
Original time: ${originalTime}
Proposed new date: ${date}
Proposed new time: ${time}

Review and accept the proposed time:
${confirmUrl}

The appointment is not confirmed at the new time until you accept it.

If you did not request this appointment, you can ignore this email.
      `.trim();

      const clientProposalEmail:
        RescheduleEmailPayload = {
          from:
            "SimpleBookMe Bookings <booking@simplebookme.com>",

          to: clientEmail,

          replyTo:
            businessReplyTo,

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
        };

      const providerCopyEmail:
        RescheduleEmailPayload = {
          from:
            "SimpleBookMe Bookings <booking@simplebookme.com>",

          to:
            providerEmail,

          replyTo:
            clientEmail,

          subject:
            `Appointment proposal sent — ` +
            `${date} at ${time}`,

          text: `
Your proposed appointment time was sent to the client.

Client: ${clientEmail}
Service: ${cleanService}
Original date: ${originalDate}
Original time: ${originalTime}
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
        };

      const result =
        await sendReservedEmailPair({
          batchId,

          firstEmail:
            clientProposalEmail,

          secondEmail:
            providerCopyEmail,

          firstIdempotencyKey,

          secondIdempotencyKey,
        });

      if (!result.firstSent) {
        console.error(
          "Reschedule client email error:",
          result.errorMessage
        );

        return createMessageResponse({
          title:
            "Could not email the client",

          message:
            "The proposed appointment time was not sent. Please contact the client directly.",

          status: 500,

          detail:
            `Client email: ${clientEmail}`,
        });
      }

      if (!result.secondSent) {
        console.error(
          "Reschedule provider copy error:",
          result.errorMessage
        );

        return createMessageResponse({
          title:
            "New time sent to the client",

          message:
            "The proposed appointment time was sent to the client, but the business copy could not be delivered.",

          status: 200,
        });
      }

      return createMessageResponse({
        title:
          "New time sent",

        message:
          "The proposed appointment time was sent to the client successfully.",

        status: 200,
      });
    }

    /* =====================================================
       CLIENT REQUESTS NEW TIME FROM BUSINESS
    ===================================================== */

    const providerText = `
A client requested a different appointment time.

Client: ${clientEmail}
Service: ${cleanService}
Current date: ${originalDate}
Current time: ${originalTime}
Requested date: ${date}
Requested time: ${time}

Accept the requested time:
${confirmUrl}

The appointment will remain unchanged until you accept the request.
    `.trim();

    const providerRequestEmail:
      RescheduleEmailPayload = {
        from:
          "SimpleBookMe Bookings <booking@simplebookme.com>",

        to:
          providerEmail,

        replyTo:
          clientEmail,

        subject:
          `Client requested a new appointment time — ` +
          `${date} at ${time}`,

        text:
          providerText,

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
      };

    const clientCopyEmail:
      RescheduleEmailPayload = {
        from:
          "SimpleBookMe Bookings <booking@simplebookme.com>",

        to:
          clientEmail,

        replyTo:
          businessReplyTo,

        subject:
          `Your appointment-change request was sent — ` +
          `${date} at ${time}`,

        text: `
Your appointment-change request was sent to ${customer.businessName}.

Service: ${cleanService}
Current date: ${originalDate}
Current time: ${originalTime}
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
      };

    const result =
      await sendReservedEmailPair({
        batchId,

        firstEmail:
          providerRequestEmail,

        secondEmail:
          clientCopyEmail,

        firstIdempotencyKey,

        secondIdempotencyKey,
      });

    if (!result.firstSent) {
      console.error(
        "Client reschedule request email error:",
        result.errorMessage
      );

      return createMessageResponse({
        title:
          "Could not email the business",

        message:
          "Your appointment-change request was not sent. Please contact the business directly.",

        status: 500,

        contact:
          publicBusinessContact,
      });
    }

    if (!result.secondSent) {
      console.error(
        "Client reschedule copy error:",
        result.errorMessage
      );

      return createMessageResponse({
        title:
          "Request sent to the business",

        message:
          "The business received your appointment-change request, but your confirmation copy could not be delivered.",

        status: 200,
      });
    }

    return createMessageResponse({
      title:
        "Request sent",

      message:
        "Your appointment-change request was sent to the business successfully.",

      status: 200,
    });
  } catch (err) {
    console.error(
      "Reschedule error:",
      err
    );

    return createMessageResponse({
      title:
        "Unable to process request",

      message:
        "An unexpected error occurred while processing the appointment-change request.",

      status: 500,
    });
  }
}
