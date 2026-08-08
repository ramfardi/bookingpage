export const runtime = "nodejs";

import type { CustomerConfig } from "@/app/lib/customerConfig";
import { verifyToken } from "@/app/lib/bookingTokens";
import { createICS } from "@/app/lib/calendar";
import { Resend } from "resend";
import { getSupabase } from "@/app/lib/supabase";
import {
  syncConfirmedAppointment,
} from "@/app/lib/appointmentEmailScheduler";
const supabase = getSupabase();
const resend = new Resend(process.env.RESEND_API_KEY!);

/* =====================
   Quota response type
===================== */

type EmailQuotaReservation = {
  allowed: boolean;
  duplicate: boolean;

  batchId?: string;

  status?:
    | "reserved"
    | "sent"
    | "partial"
    | "failed";

  used?: number;
  limit?: number;
  remaining?: number;
  required?: number;

  unitsReserved?: number;
  unitsSent?: number;

  periodStartedAt?: string;
  periodEndsAt?: string;
};

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

function sanitizeEmailDisplayName(value: string) {
  return value
    .replace(/[\r\n]+/g, " ")
    .replace(/[<>"]/g, "")
    .trim()
    .slice(0, 100);
}

/* =====================
   Error message helper
===================== */

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

/* =====================
   Browser response helper
===================== */

function createMessageResponse({
  title,
  message,
  status = 200,
  detail,
}: {
  title: string;
  message: string;
  status?: number;
  detail?: string;
}) {
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

          <title>${escapeHtml(title)}</title>
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
              ${escapeHtml(title)}
            </h1>

            <p
              style="
                margin-bottom:0;
                line-height:1.7;
                color:#4b5563;
              "
            >
              ${escapeHtml(message)}
            </p>

            ${
              detail
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
                    ${escapeHtml(detail)}
                  </p>
                `
                : ""
            }
          </main>
        </body>
      </html>
    `,
    {
      status,

      headers: {
        "Content-Type":
          "text/html; charset=utf-8",

        "Cache-Control":
          "no-store",
      },
    }
  );
}

/* =====================
   Finalize quota batch
===================== */

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
      "Failed to finalize confirmation email quota:",
      error
    );

    return false;
  }

  return true;
}

export async function GET(req: Request) {
  /*
   * These values are kept outside the main try block so that
   * unexpected errors after quota reservation can release any
   * unused quota.
   */
  let reservedBatchId: string | null = null;
  let quotaFinalized = false;

  let successfullySentUnits = 0;

  const resendEmailIds: string[] = [];

  try {
    const token =
      new URL(req.url).searchParams.get(
        "token"
      );

    if (!token) {
      return createMessageResponse({
        title: "Missing confirmation link",
        message:
          "This confirmation link is incomplete.",
        status: 400,
      });
    }

    /* =====================
       Verify token
    ===================== */

    let data;

    try {
      data = verifyToken(token);
    } catch {
      return createMessageResponse({
        title: "Invalid confirmation link",
        message:
          "This confirmation link is invalid or has expired.",
        status: 400,
      });
    }

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

    const cleanSiteId =
      String(siteId ?? "").trim();

    const cleanService =
      String(service ?? "")
        .trim()
        .slice(0, 200);

    const cleanDate =
      String(preferred_date ?? "").trim();

    const cleanTime =
      String(preferred_time ?? "").trim();

    const clientEmail =
      String(customer_email ?? "").trim();

    const cleanEventUID =
      String(eventUID ?? "").trim();

    if (
      !cleanSiteId ||
      !cleanService ||
      !cleanDate ||
      !cleanTime ||
      !clientEmail ||
      !cleanEventUID
    ) {
      return createMessageResponse({
        title: "Invalid confirmation link",
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

    /* =====================
       Fetch site config
    ===================== */

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
        "Confirmation site lookup error:",
        siteError
      );

      return createMessageResponse({
        title: "Business not found",
        message:
          "The business website associated with this appointment could not be found.",
        status: 404,
      });
    }

const customer =
  site.data as CustomerConfig;

const senderName =
  sanitizeEmailDisplayName(
    customer.businessName || "Booking"
  ) || "Booking";

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

    /* =====================
       Clean and escape values
    ===================== */

    const cleanCustomerName =
      String(customer_name ?? "")
        .trim()
        .slice(0, 100);

    const cleanCustomerMessage =
      String(customer_message ?? "")
        .trim()
        .slice(0, 1000);

    const safeBusinessName = escapeHtml(
      customer.businessName ||
        "the business"
    );

    const safeCustomerEmail =
      escapeHtml(clientEmail);

    const safeCustomerName =
      escapeHtml(cleanCustomerName);

    const safeCustomerMessage =
      escapeHtml(
        cleanCustomerMessage
      ).replace(/\r?\n/g, "<br />");

    const safeService =
      escapeHtml(cleanService);

    const safeDate =
      escapeHtml(cleanDate);

    const safeTime =
      escapeHtml(cleanTime);

    /* =====================
       Calendar attachment
    ===================== */

    const ics = createICS({
      uid: cleanEventUID,

      title:
        `Booking with ${
          customer.businessName
        }`,

      description:
        `Service: ${cleanService}`,

      date: cleanDate,
      time: cleanTime,
    });

    const attachment = {
      filename: "booking.ics",

      content:
        Buffer.from(ics).toString(
          "base64"
        ),
    };

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      "https://simplebookme.com";

    const rescheduleUrl =
      `${baseUrl}/api/booking/reschedule?token=${encodeURIComponent(
        token
      )}&actor=client`;

    /*
     * Confirmation sends:
     *
     * 1 email to the client
     * 1 email to the provider
     *
     * Total: 2 quota units
     */
    const requiredEmailUnits = 2;

    /*
     * Including the appointment date and time allows a newly
     * accepted reschedule proposal to create a new confirmation
     * batch while repeated clicks for the same date and time
     * remain idempotent.
     */
    const confirmationKey = [
      "booking-confirmation",
      cleanEventUID,
      cleanDate,
      cleanTime,
    ].join("/");

    /* =====================
       Reserve email quota
    ===================== */

    const {
      data: quotaData,
      error: quotaError,
    } = await supabase.rpc(
      "reserve_site_email_batch",
      {
        p_site_id: cleanSiteId,

        p_units:
          requiredEmailUnits,

        p_email_type:
          "booking_confirmation",

        p_idempotency_key:
          confirmationKey.slice(0, 256),
      }
    );

    if (quotaError) {
      console.error(
        "Confirmation quota error:",
        quotaError
      );

      return createMessageResponse({
        title:
          "Confirmation email unavailable",

        message:
          "The appointment emails could not be processed right now. Please contact the client directly to confirm the appointment.",

        status: 503,

        detail:
          `Client email: ${clientEmail}`,
      });
    }

    const quota =
      quotaData as EmailQuotaReservation;

    /* =====================
       Duplicate confirmation
    ===================== */

    if (quota.duplicate) {
      if (quota.status === "sent") {
        return createMessageResponse({
          title:
            "Appointment already confirmed",

          message:
            "The confirmation emails for this appointment were already sent.",

          status: 200,
        });
      }

      if (quota.status === "partial") {
        return createMessageResponse({
          title:
            "Appointment already confirmed",

          message:
            "The client confirmation was already sent, but the business copy could not be delivered.",

          status: 200,

          detail:
            `Client email: ${clientEmail}`,
        });
      }

      return createMessageResponse({
        title:
          "Confirmation is processing",

        message:
          "This appointment confirmation is already being processed. Please wait before trying again.",

        status: 409,
      });
    }

    /* =====================
       Monthly limit reached
    ===================== */

    if (!quota.allowed) {
      console.warn(
        "Confirmation email quota reached:",
        {
          siteId: cleanSiteId,
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

      return createMessageResponse({
        title:
          "Monthly email limit reached",

        message:
          "The appointment confirmation emails were not sent. Please contact the client directly to confirm the appointment.",

        status: 409,

        detail:
          `Client email: ${clientEmail}`,
      });
    }

    if (!quota.batchId) {
      console.error(
        "Confirmation quota reservation has no batch ID:",
        quota
      );

      return createMessageResponse({
        title:
          "Confirmation could not be processed",

        message:
          "The appointment confirmation could not be completed. Please contact the client directly.",

        status: 500,

        detail:
          `Client email: ${clientEmail}`,
      });
    }

    reservedBatchId =
      quota.batchId;

    /* =====================
       Email → client
    ===================== */

    const {
      data: clientEmailData,
      error: clientEmailError,
    } = await resend.emails.send(
      {
from:
  `${senderName} <booking@simplebookme.com>`,

        to: clientEmail,

        replyTo:
          customer.email?.replyTo?.trim() ||
          providerEmail,

        subject:
          `Your appointment is confirmed – ${
            customer.businessName
          }`,

        html: `
          <h2>Appointment confirmed</h2>

          <p>
            <strong>Business:</strong>
            ${safeBusinessName}
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

          <p>
            <strong>Service:</strong>
            ${safeService}
          </p>

          <p>
            <strong>Date:</strong>
            ${safeDate}
          </p>

          <p>
            <strong>Time:</strong>
            ${safeTime}
          </p>

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
            If you need to change the appointment
            time, you can request a modification:
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

          <p
            style="
              margin-top:16px;
              font-size:12px;
              color:#666;
            "
          >
            A modification request will be sent
            to the business for approval.
          </p>
        `,

        attachments: [attachment],
      },
      {
        idempotencyKey:
          [
            "booking-confirmation-client",
            cleanEventUID,
            cleanDate,
            cleanTime,
          ]
            .join("/")
            .slice(0, 256),
      }
    );

    if (
      clientEmailError ||
      !clientEmailData?.id
    ) {
      const clientErrorMessage =
        clientEmailError?.message ??
        "Resend did not return a client confirmation email ID.";

      console.error(
        "Confirmed client email error:",
        clientEmailError ??
          clientErrorMessage
      );

      /*
       * Neither email succeeded.
       * Return both reserved units.
       */
      quotaFinalized =
        await finalizeEmailBatch({
          batchId:
            reservedBatchId,

          unitsSent: 0,

          resendEmailIds: [],

          errorMessage:
            clientErrorMessage,
        });

      return createMessageResponse({
        title:
          "Client confirmation could not be sent",

        message:
          "The appointment email could not be sent to the client. Please contact the client directly.",

        status: 500,

        detail:
          `Client email: ${clientEmail}`,
      });
    }

    successfullySentUnits = 1;

    resendEmailIds.push(
      clientEmailData.id
    );

    /* =====================
       Email → provider
    ===================== */

    const {
      data: providerEmailData,
      error: providerEmailError,
    } = await resend.emails.send(
      {
from:
  `${senderName} <booking@simplebookme.com>`,

        to: providerEmail,

        replyTo: clientEmail,

        subject:
          `Appointment confirmed – ${cleanService} – ${cleanDate}`,

        html: `
          <h2>Appointment confirmed</h2>

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
            ${safeCustomerEmail}
          </p>

          <p>
            <strong>Service:</strong>
            ${safeService}
          </p>

          <p>
            <strong>Date:</strong>
            ${safeDate}
          </p>

          <p>
            <strong>Time:</strong>
            ${safeTime}
          </p>

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
                  <strong>
                    Questions or special requests:
                  </strong>

                  <p style="margin-bottom:0;">
                    ${safeCustomerMessage}
                  </p>
                </div>
              `
              : ""
          }
        `,

        attachments: [attachment],
      },
      {
        idempotencyKey:
          [
            "booking-confirmation-provider",
            cleanEventUID,
            cleanDate,
            cleanTime,
          ]
            .join("/")
            .slice(0, 256),
      }
    );

    if (
      providerEmailError ||
      !providerEmailData?.id
    ) {
      const providerErrorMessage =
        providerEmailError?.message ??
        "Resend did not return a provider confirmation email ID.";

      console.error(
        "Confirmed provider email error:",
        providerEmailError ??
          providerErrorMessage
      );

      /*
       * Client email succeeded: keep one unit.
       * Provider email failed: release one unit.
       */
      quotaFinalized =
        await finalizeEmailBatch({
          batchId:
            reservedBatchId,

          unitsSent: 1,

          resendEmailIds,

          errorMessage:
            providerErrorMessage,
        });

      return createMessageResponse({
        title:
          "Appointment confirmed",

        message:
          "The confirmation and calendar invitation were sent to the client, but the business copy could not be delivered.",

        status: 200,

        detail:
          `Client email: ${clientEmail}`,
      });
    }

    successfullySentUnits = 2;

    resendEmailIds.push(
      providerEmailData.id
    );

    /* =====================
       Both emails succeeded
    ===================== */

    quotaFinalized =
      await finalizeEmailBatch({
        batchId:
          reservedBatchId,

        unitsSent:
          requiredEmailUnits,

        resendEmailIds,

        errorMessage: null,
      });
	  
	  /* =====================================================
   AUTOMATIC REMINDER + REVIEW EMAILS
===================================================== */

try {
  await syncConfirmedAppointment({
    eventUID:
      String(
        data.eventUID
      ),

    siteId:
      String(
        data.siteId
      ),

    customerEmail:
      String(
        data.customer_email
      ).trim(),

    customerName:
      String(
        data.customer_name ||
        ""
      )
        .trim()
        .slice(
          0,
          100
        ),

    service:
      String(
        data.service
      ).trim(),

    appointmentDate:
      String(
        data.preferred_date
      ),

    appointmentTime:
      String(
        data.preferred_time
      ),

    appointmentAt:
      String(
        data.appointment_at
      ),
  });
} catch (
  automationError
) {
  /*
   * Do NOT undo a valid appointment confirmation
   * just because reminder automation had a problem.
   */
  console.error(
    "Appointment automation setup failed:",
    automationError
  );
}

    return createMessageResponse({
      title:
        "Appointment confirmed",

      message:
        "The client and business confirmation emails were sent successfully. You may close this tab.",

      status: 200,
    });
  } catch (err) {
    const errorMessage =
      getErrorMessage(err);

    console.error(
      "Confirm booking error:",
      err
    );

    /*
     * Return any units that were reserved but not successfully
     * accepted by Resend.
     */
    if (
      reservedBatchId &&
      !quotaFinalized
    ) {
      await finalizeEmailBatch({
        batchId:
          reservedBatchId,

        unitsSent:
          successfullySentUnits,

        resendEmailIds,

        errorMessage,
      });
    }

    return createMessageResponse({
      title:
        "Confirmation could not be completed",

      message:
        "An unexpected error occurred while confirming the appointment. Please contact the client directly.",

      status: 500,
    });
  }
}