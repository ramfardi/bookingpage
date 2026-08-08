export const runtime = "nodejs";

import type { CustomerConfig } from "@/app/lib/customerConfig";
import { Resend } from "resend";
import { signToken } from "@/app/lib/bookingTokens";
import crypto from "crypto";
import { getSupabase } from "@/app/lib/supabase";

const supabase = getSupabase();
const resend = new Resend(process.env.RESEND_API_KEY);

/* =====================
   Quota result type
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
   Simple rate limiter
===================== */

const rateLimit = new Map<
  string,
  {
    count: number;
    ts: number;
  }
>();

function isRateLimited(
  ip: string,
  limit = 3,
  windowMs = 10 * 60 * 1000
) {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record) {
    rateLimit.set(ip, {
      count: 1,
      ts: now,
    });

    return false;
  }

  if (now - record.ts > windowMs) {
    rateLimit.set(ip, {
      count: 1,
      ts: now,
    });

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
   Finalize quota batch

   Any reserved units that were not successfully sent
   are returned to the site's available quota.
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
      "Failed to finalize booking email quota:",
      error
    );

    return false;
  }

  return true;
}

export async function POST(req: Request) {
  /*
   * These variables remain available to the catch block.
   * If an unexpected error happens after quota reservation,
   * the unused quota can still be returned.
   */
  let reservedBatchId: string | null = null;
  let quotaFinalized = false;

  let successfullySentUnits = 0;
  const resendEmailIds: string[] = [];

  try {
    const body = await req.json();

const {
  customerKey,
  service,
  preferred_date,
  preferred_time,
  appointment_at,
  customer_email,
  customer_name,
  customer_message,
  company,
} = body;

    /* =====================
       Honeypot
    ===================== */

    if (company) {
      return Response.json({
        success: true,
      });
    }

    /* =====================
       Rate limit
    ===================== */

    const ip =
      req.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() ?? "unknown";

    if (isRateLimited(ip)) {
      return Response.json(
        {
          error: "Too many requests",
        },
        {
          status: 429,
        }
      );
    }

    /* =====================
       Clean input
    ===================== */

    const cleanCustomerKey = String(
      customerKey ?? ""
    ).trim();

    const clientEmail = String(
      customer_email ?? ""
    ).trim();

    const cleanService = String(service ?? "")
      .trim()
      .slice(0, 200);

    const cleanDate = String(
      preferred_date ?? ""
    ).trim();

    const cleanTime = String(
      preferred_time ?? ""
    ).trim();
	
	const cleanAppointmentAt =
  String(
    appointment_at ?? ""
  ).trim();


const parsedAppointmentAt =
  new Date(
    cleanAppointmentAt
  );


if (
  !cleanAppointmentAt ||
  Number.isNaN(
    parsedAppointmentAt.getTime()
  )
) {
  return Response.json(
    {
      error:
        "Invalid appointment date/time",
    },
    {
      status: 400,
    }
  );
}


const normalizedAppointmentAt =
  parsedAppointmentAt.toISOString();

    const cleanCustomerName = String(
      customer_name ?? ""
    )
      .trim()
      .slice(0, 100);

    const cleanCustomerMessage = String(
      customer_message ?? ""
    )
      .trim()
      .slice(0, 1000);

    if (
      !cleanCustomerKey ||
      !cleanService ||
      !cleanDate ||
      !cleanTime ||
      !clientEmail
    ) {
      return Response.json(
        {
          error: "Invalid booking request",
        },
        {
          status: 400,
        }
      );
    }

    const emailIsValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        clientEmail
      );

    if (!emailIsValid) {
      return Response.json(
        {
          error: "Invalid email address",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================
       Load site
    ===================== */

    const {
      data: site,
      error: siteError,
    } = await supabase
      .from("sites")
      .select("data")
      .eq("site_id", cleanCustomerKey)
      .single();

    if (siteError || !site) {
      console.error(
        "Booking site lookup error:",
        siteError
      );

      return Response.json(
        {
          error: "Site not found",
        },
        {
          status: 404,
        }
      );
    }

    const customer =
      site.data as CustomerConfig;
	  
	  const senderName =
  sanitizeEmailDisplayName(
    customer.businessName || "Booking"
  ) || "Booking";

    if (
      !customer.email?.bookingNotifications
    ) {
      return Response.json(
        {
          error:
            "Booking email not configured",
        },
        {
          status: 400,
        }
      );
    }

    const providerEmail =
      customer.email.bookingNotifications.trim();

    const providerEmailIsValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        providerEmail
      );

    if (!providerEmailIsValid) {
      return Response.json(
        {
          error:
            "The business booking email is invalid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * These are the public contact fields shown when the
     * site's email quota has been reached.
     *
     * The private bookingNotifications address is not exposed.
     */
    const publicBusinessPhone =
      customer.contact?.phone?.trim() ||
      null;

    const publicBusinessEmail =
      customer.contact?.email?.trim() ||
      null;

    /* =====================
       Booking identity
    ===================== */

    const eventUID = `booking-${crypto
      .createHash("sha1")
      .update(
        [
          cleanCustomerKey,
          clientEmail.toLowerCase(),
          cleanService.toLowerCase(),
          cleanDate,
          cleanTime,
        ].join("-")
      )
      .digest("hex")}`;

    /*
     * Store the optional name and message in the signed token.
     * This allows confirmation and rescheduling routes to
     * preserve them.
     */
const token = signToken({
  siteId:
    cleanCustomerKey,

  service:
    cleanService,

  preferred_date:
    cleanDate,

  preferred_time:
    cleanTime,

  /*
   * Absolute appointment time.
   */
  appointment_at:
    normalizedAppointmentAt,

  customer_email:
    clientEmail,

  customer_name:
    cleanCustomerName,

  customer_message:
    cleanCustomerMessage,

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

    /* =====================
       Escaped email values
    ===================== */


    const safeClientEmail =
      escapeHtml(clientEmail);

    const safeService =
      escapeHtml(cleanService);

    const safeDate =
      escapeHtml(cleanDate);

    const safeTime =
      escapeHtml(cleanTime);

    const safeCustomerName =
      escapeHtml(cleanCustomerName);

    const safeCustomerMessage =
      escapeHtml(
        cleanCustomerMessage
      ).replace(/\r?\n/g, "<br />");

    /*
     * This route sends:
     *
     * 1 email to the provider
     * 1 email to the client
     *
     * Therefore, one booking request requires 2 quota units.
     */
    const requiredEmailUnits = 1;

    /* =====================
       Reserve email quota
    ===================== */

    const {
      data: quotaData,
      error: quotaError,
    } = await supabase.rpc(
      "reserve_site_email_batch",
      {
        p_site_id: cleanCustomerKey,
        p_units: requiredEmailUnits,
        p_email_type: "booking",
        p_idempotency_key:
          `booking/${eventUID}`,
      }
    );

    if (quotaError) {
      console.error(
        "Booking email quota error:",
        quotaError
      );

      /*
       * Fail closed:
       * do not send emails that cannot be counted.
       */
      return Response.json(
        {
          success: false,

          code:
            "EMAIL_QUOTA_UNAVAILABLE",

          error:
            "Online booking is temporarily unavailable. Please contact the business directly.",

          contact: {
            businessName:
              customer.businessName || null,

            phone:
              publicBusinessPhone,

            email:
              publicBusinessEmail,
          },
        },
        {
          status: 503,
        }
      );
    }

    const quota =
      quotaData as EmailQuotaReservation;

    /* =====================
       Handle duplicate request
    ===================== */

if (quota.duplicate) {
  if (
    quota.status === "sent" ||
    quota.status === "partial"
  ) {
    return Response.json({
      success: true,
      duplicate: true,

      message:
        "This booking request was already sent to the business.",
    });
  }

  return Response.json(
    {
      success: false,

      code:
        "BOOKING_ALREADY_PROCESSING",

      error:
        "This booking request is already being processed.",
    },
    {
      status: 409,
    }
  );
}

    /* =====================
       Monthly quota reached
    ===================== */

    if (!quota.allowed) {
      console.warn(
        "Booking email quota reached:",
        {
          siteId: cleanCustomerKey,
          used: quota.used,
          limit: quota.limit,
          remaining: quota.remaining,
          required: quota.required,
          periodEndsAt:
            quota.periodEndsAt,
        }
      );

      return Response.json(
        {
          success: false,

          code:
            "EMAIL_LIMIT_REACHED",

          error:
            "Online booking requests are temporarily unavailable for this business. Please contact the business directly.",

          contact: {
            businessName:
              customer.businessName || null,

            phone:
              publicBusinessPhone,

            email:
              publicBusinessEmail,
          },
        },
        {
          status: 409,
        }
      );
    }

    if (!quota.batchId) {
      console.error(
        "Quota reservation succeeded without a batch ID:",
        quota
      );

      return Response.json(
        {
          success: false,

          error:
            "The booking request could not be processed.",
        },
        {
          status: 500,
        }
      );
    }

    reservedBatchId = quota.batchId;

    /* =====================
       Provider email
    ===================== */

    const {
      data: providerEmailData,
      error: providerEmailError,
    } = await resend.emails.send(
      {
from:
  `${senderName} <booking@simplebookme.com>`,

        to: providerEmail,

        // Replying replies to the person booking.
        replyTo: clientEmail,

        subject:
          "New booking request",

        html: `
          <h2>New booking request</h2>

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
      },
      {
        idempotencyKey:
          `booking-provider/${eventUID}`.slice(
            0,
            256
          ),
      }
    );

    if (
      providerEmailError ||
      !providerEmailData?.id
    ) {
      const providerErrorMessage =
        providerEmailError?.message ??
        "Resend did not return a provider email ID.";

      console.error(
        "Provider booking email error:",
        providerEmailError ??
          providerErrorMessage
      );

      /*
       * Neither email succeeded.
       * Return both reserved units.
       */
      quotaFinalized =
        await finalizeEmailBatch({
          batchId: reservedBatchId,
          unitsSent: 0,
          resendEmailIds: [],
          errorMessage:
            providerErrorMessage,
        });

      return Response.json(
        {
          success: false,

          error:
            "The booking request could not be emailed to the business.",
        },
        {
          status: 500,
        }
      );
    }

    successfullySentUnits = 1;

    resendEmailIds.push(
      providerEmailData.id
    );
	
	quotaFinalized =
  await finalizeEmailBatch({
    batchId: reservedBatchId,
    unitsSent: 1,
    resendEmailIds,
    errorMessage: null,
  });

return Response.json({
  success: true,
});


  } catch (err) {
    const errorMessage =
      getErrorMessage(err);

    console.error(
      "Send booking error:",
      err
    );

    /*
     * Handle an unexpected exception after quota reservation.
     * Keep only units that Resend already accepted and return
     * all remaining reserved units.
     */
    if (
      reservedBatchId &&
      !quotaFinalized
    ) {
      await finalizeEmailBatch({
        batchId: reservedBatchId,
        unitsSent:
          successfullySentUnits,
        resendEmailIds,
        errorMessage,
      });
    }

    return Response.json(
      {
        success: false,
        error:
          "Failed to send booking",
      },
      {
        status: 500,
      }
    );
  }
}