export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";

import type { CustomerConfig } from "@/app/lib/customerConfig";
import { getSupabase } from "@/app/lib/supabase";

const supabase = getSupabase();
const resend = new Resend(process.env.RESEND_API_KEY);

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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

/*
 * Only allow HTTP and HTTPS links inside the email.
 */
function getSafePageUrl(value: string) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

/*
 * Finalizes the email reservation.
 *
 * If unitsSent is zero, the reserved unit is returned to the
 * site's available monthly quota.
 */
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
      "Failed to finalize instant-quote quota:",
      error
    );

    return false;
  }

  return true;
}

export async function POST(req: Request) {
  let reservedBatchId: string | null = null;
  let quotaFinalized = false;
  let successfullySentUnits = 0;

  const resendEmailIds: string[] = [];

  try {
    const body = await req.json();

    /*
     * siteId is required because it identifies the quota and
     * lets the server retrieve the correct business details.
     */
    const siteId = String(
      body.siteId ?? ""
    ).trim();

    const submittedBusinessName = String(
      body.businessName ?? ""
    )
      .trim()
      .slice(0, 100);

    const submittedSubdomain = String(
      body.subdomain ?? ""
    )
      .trim()
      .slice(0, 100);

    const customerName = String(
      body.customerName ?? ""
    )
      .trim()
      .slice(0, 100);

    const customerContact = String(
      body.customerContact ?? ""
    )
      .trim()
      .slice(0, 200);

    const message = String(
      body.message ?? ""
    )
      .trim()
      .slice(0, 2000);

    const pageUrl = String(
      body.pageUrl ?? ""
    )
      .trim()
      .slice(0, 1000);

    /*
     * Step 12 will add requestId to the frontend.
     *
     * The fallback below still protects against repeated
     * identical submissions within the same 10-minute period.
     */
    const suppliedRequestId = String(
      body.requestId ?? ""
    )
      .trim()
      .slice(0, 128);

    /*
     * Optional honeypot support.
     */
    const company = String(
      body.company ?? ""
    ).trim();

    if (company) {
      return NextResponse.json({
        ok: true,
      });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Missing RESEND_API_KEY.",
        },
        {
          status: 500,
        }
      );
    }

    if (!siteId) {
      return NextResponse.json(
        {
          error:
            "The website identifier is missing.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !customerName ||
      !customerContact ||
      !message
    ) {
      return NextResponse.json(
        {
          error:
            "Name, contact, and message are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      message.length < 10 ||
      message.length > 2000
    ) {
      return NextResponse.json(
        {
          error:
            "Message must be between 10 and 2000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================
       Load site from Supabase
    ===================== */

    const {
      data: site,
      error: siteError,
    } = await supabase
      .from("sites")
      .select("data")
      .eq("site_id", siteId)
      .single();

    if (siteError || !site) {
      console.error(
        "Instant-quote site lookup error:",
        siteError
      );

      return NextResponse.json(
        {
          error:
            "Business website not found.",
        },
        {
          status: 404,
        }
      );
    }

    const customer =
      site.data as CustomerConfig;

    /*
     * The email recipient comes from Supabase.
     *
     * Never trust body.toEmail because a visitor could modify
     * the browser request and send email to another address.
     */
    const businessEmail =
      customer.email?.bookingNotifications?.trim() ||
      customer.contact?.email?.trim() ||
      "";

    if (!isValidEmail(businessEmail)) {
      return NextResponse.json(
        {
          error:
            "The business email is missing or invalid.",
        },
        {
          status: 400,
        }
      );
    }

    const businessName = (
      customer.businessName ||
      submittedBusinessName ||
      "Business"
    )
      .replace(/[\r\n]+/g, " ")
      .trim()
      .slice(0, 100);

    const subdomain =
      customer.subdomain?.trim() ||
      submittedSubdomain;

    /*
     * Only these public contact fields are returned when the
     * quota is reached.
     */
    const publicBusinessPhone =
      customer.contact?.phone?.trim() ||
      null;

    const publicBusinessEmail =
      customer.contact?.email?.trim() ||
      null;

    /* =====================
       Create request identity
    ===================== */

    const tenMinuteBucket =
      Math.floor(
        Date.now() /
          (10 * 60 * 1000)
      );

    const fallbackRequestId = crypto
      .createHash("sha256")
      .update(
        [
          siteId,
          customerName.toLowerCase(),
          customerContact.toLowerCase(),
          message,
          pageUrl,
          String(tenMinuteBucket),
        ].join("|")
      )
      .digest("hex");

    const quoteRequestId =
      suppliedRequestId ||
      fallbackRequestId;

    const quotaIdempotencyKey =
      `instant-quote/${quoteRequestId}`.slice(
        0,
        256
      );

    /*
     * One instant quote sends one email to the business.
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
        p_site_id: siteId,
        p_units:
          requiredEmailUnits,
        p_email_type:
          "instant_quote",
        p_idempotency_key:
          quotaIdempotencyKey,
      }
    );

    if (quotaError) {
      console.error(
        "Instant-quote quota error:",
        quotaError
      );

      return NextResponse.json(
        {
          ok: false,

          code:
            "EMAIL_QUOTA_UNAVAILABLE",

          error:
            "Online quote requests are temporarily unavailable. Please contact the business directly.",

          contact: {
            businessName,
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
       Duplicate request
    ===================== */

    if (quota.duplicate) {
      if (
        quota.status === "sent" ||
        quota.status === "partial"
      ) {
        return NextResponse.json({
          ok: true,
          duplicate: true,
          emailSent: true,

          message:
            "This quote request was already sent.",
        });
      }

      return NextResponse.json(
        {
          ok: false,

          code:
            "QUOTE_ALREADY_PROCESSING",

          error:
            "This quote request is already being processed.",
        },
        {
          status: 409,
        }
      );
    }

    /* =====================
       Monthly limit reached
    ===================== */

    if (!quota.allowed) {
      console.warn(
        "Instant-quote email quota reached:",
        {
          siteId,
          used: quota.used,
          limit: quota.limit,
          remaining:
            quota.remaining,
          periodEndsAt:
            quota.periodEndsAt,
        }
      );

      return NextResponse.json(
        {
          ok: false,

          code:
            "EMAIL_LIMIT_REACHED",

          error:
            "Online quote requests are temporarily unavailable. Please contact the business directly.",

          contact: {
            businessName,
            phone:
              publicBusinessPhone,
            email:
              publicBusinessEmail,
          },

          quota: {
            used:
              quota.used ?? null,

            limit:
              quota.limit ?? null,

            remaining:
              quota.remaining ?? 0,

            periodEndsAt:
              quota.periodEndsAt ??
              null,
          },
        },
        {
          status: 409,
        }
      );
    }

    if (!quota.batchId) {
      console.error(
        "Instant-quote quota reservation has no batch ID:",
        quota
      );

      return NextResponse.json(
        {
          ok: false,

          error:
            "The quote request could not be processed.",
        },
        {
          status: 500,
        }
      );
    }

    reservedBatchId =
      quota.batchId;

    /* =====================
       Prepare email contents
    ===================== */

    const safeBusinessName =
      escapeHtml(businessName);

    const safeCustomerName =
      escapeHtml(customerName);

    const safeCustomerContact =
      escapeHtml(customerContact);

    const safeMessage =
      escapeHtml(message).replace(
        /\r?\n/g,
        "<br />"
      );

    const cleanPageUrl =
      getSafePageUrl(pageUrl);

    const safePageUrl =
      escapeHtml(cleanPageUrl);

    const safeSubdomain =
      escapeHtml(subdomain);

    const safeSiteId =
      escapeHtml(siteId);

    const replyTo =
      isValidEmail(customerContact)
        ? customerContact
        : undefined;

    /* =====================
       Send email to business
    ===================== */

    const {
      data: emailData,
      error: emailError,
    } = await resend.emails.send(
      {
        from:
          process.env
            .RESEND_FROM_EMAIL ||
          "SimpleBookMe <support@simplebookme.com>",

        to: businessEmail,

        /*
         * When the customer supplied an email address, replying
         * to the quote notification replies directly to them.
         */
        replyTo,

        subject:
          `New Instant Quote request for ${businessName}`,

        html: `
          <div
            style="
              font-family:Arial,sans-serif;
              line-height:1.6;
              color:#111827;
            "
          >
            <h2>
              New Instant Quote request
            </h2>

            <p>
              A visitor sent a quote request from
              your SimpleBookMe website.
            </p>

            <div
              style="
                padding:16px;
                border:1px solid #e5e7eb;
                border-radius:12px;
                background:#f9fafb;
              "
            >
              <p>
                <strong>Business:</strong>
                ${safeBusinessName}
              </p>

              <p>
                <strong>Customer name:</strong>
                ${safeCustomerName}
              </p>

              <p>
                <strong>Customer contact:</strong>
                ${safeCustomerContact}
              </p>

              <p>
                <strong>Message:</strong>
                <br />
                ${safeMessage}
              </p>
            </div>

            <p>
              <strong>Website page:</strong>
              <br />

              ${
                safePageUrl
                  ? `
                    <a href="${safePageUrl}">
                      ${safePageUrl}
                    </a>
                  `
                  : "Not provided"
              }
            </p>

            <p
              style="
                font-size:12px;
                color:#6b7280;
              "
            >
              Site ID: ${safeSiteId}
              <br />

              Subdomain: ${safeSubdomain}
            </p>
          </div>
        `,

        text: `
New Instant Quote request

Business: ${businessName}

Customer name:
${customerName}

Customer contact:
${customerContact}

Message:
${message}

Website page:
${cleanPageUrl || "Not provided"}

Site ID: ${siteId}
Subdomain: ${subdomain}
        `.trim(),
      },
      {
        idempotencyKey:
          `instant-quote-email/${reservedBatchId}`.slice(
            0,
            256
          ),
      }
    );

    if (
      emailError ||
      !emailData?.id
    ) {
      const emailErrorMessage =
        emailError?.message ??
        "Resend did not return an instant-quote email ID.";

      console.error(
        "Instant quote email error:",
        emailError ??
          emailErrorMessage
      );

      /*
       * Resend did not accept the email.
       * Return the reserved unit.
       */
      quotaFinalized =
        await finalizeEmailBatch({
          batchId:
            reservedBatchId,

          unitsSent: 0,

          resendEmailIds: [],

          errorMessage:
            emailErrorMessage,
        });

      return NextResponse.json(
        {
          ok: false,

          error:
            "Failed to send quote request.",
        },
        {
          status: 500,
        }
      );
    }

    successfullySentUnits = 1;

    resendEmailIds.push(
      emailData.id
    );

    /* =====================
       Finalize successful send
    ===================== */

    quotaFinalized =
      await finalizeEmailBatch({
        batchId:
          reservedBatchId,

        unitsSent: 1,

        resendEmailIds,

        errorMessage: null,
      });

    return NextResponse.json({
      ok: true,
      emailSent: true,

      quotaTrackingFinalized:
        quotaFinalized,
    });
  } catch (error) {
    const errorMessage =
      getErrorMessage(error);

    console.error(
      "Instant quote route error:",
      error
    );

    /*
     * Return unused quota if an unexpected error happened after
     * the quota was reserved.
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

    return NextResponse.json(
      {
        ok: false,

        error:
          "Unexpected quote request error.",
      },
      {
        status: 500,
      }
    );
  }
}