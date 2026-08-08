import { Resend } from "resend";

import type { CustomerConfig } from "@/app/lib/customerConfig";

import { getSupabase } from "@/app/lib/supabase";


const supabase =
  getSupabase();


const resend =
  new Resend(
    process.env.RESEND_API_KEY!
  );


/*
 * Resend officially supports up to 30 days.
 *
 * Use 29 days internally so we never sit exactly
 * on the API boundary.
 */
const SCHEDULE_WINDOW_MS =
  29 *
  24 *
  60 *
  60 *
  1000;


/*
 * We currently don't store individual service durations.
 *
 * Simple assumption:
 *
 * Appointment = 1 hour
 * Review request = 1 hour after appointment ends
 *
 * Therefore review = appointment start + 2 hours.
 */
const REVIEW_AFTER_START_MS =
  2 *
  60 *
  60 *
  1000;


type EmailKind =
  | "reminder"
  | "review";


type EmailQuotaReservation = {
  allowed: boolean;

  duplicate: boolean;

  batchId?: string;

  status?:
    | "reserved"
    | "sent"
    | "partial"
    | "failed";
};


export type AppointmentAutomationRow = {
  event_uid: string;

  site_id: string;

  customer_email: string;

  customer_name:
    string | null;

  service: string;

  appointment_date: string;

  appointment_time: string;

  appointment_at: string;

  reminder_at: string;

  review_at: string;

  reminder_resend_id:
    string | null;

  review_resend_id:
    string | null;

  reminder_quota_counted:
    boolean;

  review_quota_counted:
    boolean;

  created_at?: string;

  updated_at?: string;
};


type ConfirmedAppointmentInput = {
  eventUID: string;

  siteId: string;

  customerEmail: string;

  customerName?: string;

  service: string;

  appointmentDate: string;

  appointmentTime: string;

  appointmentAt: string;
};


/* =====================================================
   BASIC HELPERS
===================================================== */

function escapeHtml(
  value: string
) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function sanitizeEmailDisplayName(
  value: string
) {
  return value
    .replace(/[\r\n]+/g, " ")
    .replace(/[<>"]/g, "")
    .trim()
    .slice(0, 100);
}

function validUrl(
  value?: string | null
) {
  if (!value) {
    return null;
  }

  try {
    const url =
      new URL(
        value.trim()
      );

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}


function isInsideResendWindow(
  sendAt: Date
) {
  return (
    sendAt.getTime() <=
    Date.now() +
      SCHEDULE_WINDOW_MS
  );
}


/* =====================================================
   LOAD BUSINESS CONFIG
===================================================== */

async function loadBusiness(
  siteId: string
) {
  const {
    data,
    error,
  } =
    await supabase
      .from("sites")
      .select("data")
      .eq(
        "site_id",
        siteId
      )
      .single();


  if (
    error ||
    !data
  ) {
    console.error(
      "Appointment automation business lookup failed:",
      error
    );

    return null;
  }


  return data.data as CustomerConfig;
}


/* =====================================================
   EXISTING EMAIL QUOTA SYSTEM
===================================================== */

async function reserveOneQuotaUnit({
  siteId,
  eventUID,
  kind,
  sendAt,
}: {
  siteId: string;

  eventUID: string;

  kind: EmailKind;

  sendAt: string;
}) {
  /*
   * Include the scheduled time.
   *
   * If a reminder has already actually been sent and then
   * the appointment gets rescheduled, the replacement
   * reminder is a genuinely new email and may consume
   * another quota unit.
   */
  const key =
    `appointment-${kind}/${eventUID}/${sendAt}`
      .slice(
        0,
        250
      );


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "reserve_site_email_batch",
      {
        p_site_id:
          siteId,

        p_units:
          1,

        /*
         * Reuse your existing booking quota category.
         */
        p_email_type:
          "booking",

        p_idempotency_key:
          key,
      }
    );


  if (error) {
    console.error(
      "Automatic appointment email quota error:",
      error
    );

    return null;
  }


  return data as EmailQuotaReservation;
}


async function finalizeQuota({
  batchId,
  sent,
  resendId,
  errorMessage,
}: {
  batchId: string;

  sent: boolean;

  resendId?: string;

  errorMessage?: string;
}) {
  const {
    error,
  } =
    await supabase.rpc(
      "finalize_site_email_batch",
      {
        p_batch_id:
          batchId,

        p_units_sent:
          sent
            ? 1
            : 0,

        p_resend_email_ids:
          resendId
            ? [resendId]
            : [],

        p_error_message:
          sent
            ? null
            : errorMessage ||
              "Automatic appointment email could not be scheduled.",
      }
    );


  if (error) {
    console.error(
      "Automatic appointment quota finalize error:",
      error
    );
  }
}


/* =====================================================
   EMAIL CONTENT
===================================================== */

function buildReminderEmail({
  row,
  customer,
}: {
  row: AppointmentAutomationRow;

  customer: CustomerConfig;
}) {
  const businessName =
    customer.businessName ||
    "the business";


  const safeBusinessName =
    escapeHtml(
      businessName
    );


  const safeName =
    escapeHtml(
      row.customer_name ||
      ""
    );


  const safeService =
    escapeHtml(
      row.service
    );


  const safeDate =
    escapeHtml(
      row.appointment_date
    );


  const safeTime =
    escapeHtml(
      row.appointment_time
        .slice(
          0,
          5
        )
    );
	
	const contactEmail =
  customer.contact
    ?.email
    ?.trim();

const contactPhone =
  customer.contact
    ?.phone
    ?.trim();


  return {
    subject:
      `Appointment reminder — ${businessName}`,

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

        <h2>
          Appointment reminder
        </h2>

        ${
          safeName
            ? `
              <p>
                Hi ${safeName},
              </p>
            `
            : ""
        }

        <p>
          This is a reminder about your upcoming
          appointment with
          <strong>
            ${safeBusinessName}
          </strong>.
        </p>

        <div
          style="
            margin:20px 0;
            padding:16px;
            background:#f9fafb;
            border:1px solid #e5e7eb;
            border-radius:8px;
          "
        >

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

        </div>

${
  contactEmail || contactPhone
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
        <p style="margin-top:0;">
          <strong>Need to make a change?</strong>
        </p>

        <p>
          Please contact ${safeBusinessName} directly:
        </p>

        ${
          contactEmail
            ? `
              <p>
                <strong>Email:</strong>
                <a
                  href="mailto:${escapeHtml(contactEmail)}"
                >
                  ${escapeHtml(contactEmail)}
                </a>
              </p>
            `
            : ""
        }

        ${
          contactPhone
            ? `
              <p>
                <strong>Phone:</strong>
                ${escapeHtml(contactPhone)}
              </p>
            `
            : ""
        }
      </div>
    `
    : ""
}

<p>
  We look forward to seeing you.
</p>

      </div>
    `,
  };
}


function buildReviewEmail({
  row,
  customer,
}: {
  row: AppointmentAutomationRow;

  customer: CustomerConfig;
}) {
  const businessName =
    customer.businessName ||
    "the business";


  const safeBusinessName =
    escapeHtml(
      businessName
    );


  const safeName =
    escapeHtml(
      row.customer_name ||
      ""
    );


  /*
   * This is already part of your website setup/edit flow.
   *
   * It can be the Google Review URL or another review URL.
   */
  const reviewLink =
    validUrl(
      customer
        .testimonials
        ?.googleReviewLink
    );


  /*
   * Business supplied a review link.
   */
  if (
    reviewLink
  ) {
    return {
      subject:
        `How was your experience with ${businessName}?`,

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

          <h2>
            Thank you for visiting
            ${safeBusinessName}
          </h2>

          ${
            safeName
              ? `
                <p>
                  Hi ${safeName},
                </p>
              `
              : ""
          }

          <p>
            We hope everything went well with your
            appointment.
          </p>

          <p>
            Your feedback would be greatly appreciated.
          </p>

          <p
            style="
              margin:28px 0;
            "
          >

            <a
              href="${escapeHtml(reviewLink)}"
              style="
                display:inline-block;
                padding:12px 18px;
                background:#4f46e5;
                color:#ffffff;
                text-decoration:none;
                border-radius:7px;
                font-weight:600;
              "
            >
              Leave feedback
            </a>

          </p>

          <p
            style="
              font-size:12px;
              color:#6b7280;
            "
          >
            Thank you for supporting
            ${safeBusinessName}.
          </p>

        </div>
      `,
    };
  }


  /*
   * No review link:
   *
   * Fall back to the public business contact information.
   */
  const contactEmail =
    customer.contact
      ?.email
      ?.trim();


  const contactPhone =
    customer.contact
      ?.phone
      ?.trim();


  return {
    subject:
      `How was your experience with ${businessName}?`,

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

        <h2>
          Thank you for visiting
          ${safeBusinessName}
        </h2>

        ${
          safeName
            ? `
              <p>
                Hi ${safeName},
              </p>
            `
            : ""
        }

        <p>
          We hope everything went well with your
          appointment.
        </p>

        <p>
          We would appreciate your feedback.
          Please feel free to contact
          ${safeBusinessName}.
        </p>

        ${
          contactEmail
            ? `
              <p>
                <strong>Email:</strong>

                <a
                  href="mailto:${escapeHtml(contactEmail)}"
                >
                  ${escapeHtml(contactEmail)}
                </a>
              </p>
            `
            : ""
        }

        ${
          contactPhone
            ? `
              <p>
                <strong>Phone:</strong>

                ${escapeHtml(contactPhone)}
              </p>
            `
            : ""
        }

        ${
          !contactEmail &&
          !contactPhone
            ? `
              <p>
                You can reply directly to this email
                to share your feedback.
              </p>
            `
            : ""
        }

      </div>
    `,
  };
}


/* =====================================================
   CANCEL OLD SCHEDULED EMAIL DURING RESCHEDULE
===================================================== */

async function prepareOldEmailForReplacement({
  resendId,
  quotaCounted,
}: {
  resendId: string | null;

  quotaCounted: boolean;
}) {
  if (
    !resendId
  ) {
    return {
      resendId: null,
      quotaCounted,
    };
  }


  /*
   * First try to cancel the old scheduled email.
   */
  const {
    error:
      cancelError,
  } =
    await resend
      .emails
      .cancel(
        resendId
      );


  if (
    !cancelError
  ) {
    /*
     * Old email never went out.
     *
     * The quota unit can conceptually be reused for
     * the replacement email.
     */
    return {
      resendId: null,

      quotaCounted,
    };
  }


  /*
   * Cancellation may fail because it already left
   * the scheduled state.
   *
   * Retrieve it to determine whether it was already
   * sent.
   */
  const {
    data:
      existingEmail,

    error:
      retrieveError,
  } =
    await resend
      .emails
      .get(
        resendId
      );


  if (
    !retrieveError &&
    existingEmail &&
    !existingEmail.scheduled_at
  ) {
    /*
     * The old message has already been sent / processed.
     *
     * A replacement is a NEW email and therefore must
     * consume another quota unit.
     */
    return {
      resendId: null,

      quotaCounted:
        false,
    };
  }


  /*
   * Don't risk creating a duplicate while an old email
   * might still be scheduled.
   */
  throw new Error(
    `Could not safely replace scheduled email ${resendId}.`
  );
}


/* =====================================================
   CREATE ONE AUTOMATIC EMAIL
===================================================== */

async function ensureOneEmail({
  row,
  customer,
  kind,
  sendAt,
  currentResendId,
  quotaCounted,
}: {
  row: AppointmentAutomationRow;

  customer: CustomerConfig;

  kind: EmailKind;

  sendAt: Date;

  currentResendId:
    string | null;

  quotaCounted:
    boolean;
}) {
  /*
   * Already scheduled.
   */
  if (
    currentResendId
  ) {
    return {
      resendId:
        currentResendId,

      quotaCounted,
    };
  }


  /*
   * Don't schedule reminder emails after the
   * appointment has already started.
   */
  if (
    kind === "reminder" &&
    new Date(
      row.appointment_at
    ).getTime() <=
      Date.now()
  ) {
    return {
      resendId: null,

      quotaCounted,
    };
  }


  /*
   * More than ~30 days away.
   *
   * Daily Vercel cron will handle it later.
   */
  if (
    !isInsideResendWindow(
      sendAt
    )
  ) {
    return {
      resendId: null,

      quotaCounted,
    };
  }


  let counted =
    quotaCounted;


  let reservedBatchId:
    string | null =
      null;


  /*
   * Consume one quota unit only if this email has
   * never been counted before.
   */
  if (
    !counted
  ) {
    const quota =
      await reserveOneQuotaUnit({
        siteId:
          row.site_id,

        eventUID:
          row.event_uid,

        kind,

        sendAt:
          sendAt.toISOString(),
      });


    if (
      !quota
    ) {
      return {
        resendId: null,

        quotaCounted:
          false,
      };
    }


    /*
     * Idempotent duplicate reservation.
     */
    if (
      quota.duplicate
    ) {
      if (
        quota.status === "sent" ||
        quota.status === "partial"
      ) {
        counted =
          true;
      } else {
        return {
          resendId: null,

          quotaCounted:
            false,
        };
      }
    } else {

      if (
        !quota.allowed
      ) {
        /*
         * Monthly quota exhausted.
         *
         * Leave unscheduled. The daily cron may retry
         * later if the quota period resets before the
         * appointment.
         */
        return {
          resendId: null,

          quotaCounted:
            false,
        };
      }


      if (
        !quota.batchId
      ) {
        console.error(
          "Automatic appointment email quota reservation returned no batch ID."
        );

        return {
          resendId: null,

          quotaCounted:
            false,
        };
      }


      reservedBatchId =
        quota.batchId;
    }
  }

const senderName =
  sanitizeEmailDisplayName(
    customer.businessName ||
      "SimpleBookMe Bookings"
  ) ||
  "SimpleBookMe Bookings";

  const email =
    kind === "reminder"
      ? buildReminderEmail({
          row,
          customer,
        })
      : buildReviewEmail({
          row,
          customer,
        });


  const replyTo =
    customer.email
      ?.replyTo
      ?.trim() ||

    customer.contact
      ?.email
      ?.trim() ||

    customer.email
      ?.bookingNotifications
      ?.trim();


  /*
   * If the intended time has already arrived,
   * send immediately.
   *
   * Example:
   * business confirms an appointment only
   * 12 hours before it starts.
   */
  const shouldSendNow =
    sendAt.getTime() <=
    Date.now() +
      60 * 1000;


const emailPayload = {
  from:
    `${senderName} <booking@simplebookme.com>`,

  to:
    row.customer_email,

    ...(replyTo
      ? {
          replyTo,
        }
      : {}),

    subject:
      email.subject,

    html:
      email.html,

    /*
     * Useful inside the Resend dashboard.
     */
    tags: [
      {
        name:
          "category",

        value:
          kind === "reminder"
            ? "appointment_reminder"
            : "appointment_review",
      },
    ],

    ...(
      shouldSendNow
        ? {}
        : {
            scheduledAt:
              sendAt.toISOString(),
          }
    ),
  };


  const {
    data,
    error,
  } =
    await resend
      .emails
      .send(
        emailPayload,

        {
          idempotencyKey:
            `${kind}/${row.event_uid}/${sendAt.toISOString()}`
              .slice(
                0,
                256
              ),
        }
      );


  /*
   * Resend rejected the email.
   */
  if (
    error ||
    !data?.id
  ) {
    console.error(
      `Automatic ${kind} email scheduling failed:`,
      error
    );


    /*
     * If we just reserved a new quota unit,
     * return it.
     */
    if (
      reservedBatchId
    ) {
      await finalizeQuota({
        batchId:
          reservedBatchId,

        sent:
          false,

        errorMessage:
          error?.message ||
          `Automatic ${kind} email scheduling failed.`,
      });
    }


    return {
      resendId: null,

      /*
       * If this was a reused quota unit from a previously
       * cancelled email, retain it.
       */
      quotaCounted:
        quotaCounted,
    };
  }


  /*
   * We made a NEW quota reservation and Resend accepted
   * the scheduled email.
   *
   * Count it now.
   */
  if (
    reservedBatchId
  ) {
    await finalizeQuota({
      batchId:
        reservedBatchId,

      sent:
        true,

      resendId:
        data.id,
    });


    counted =
      true;
  }


  return {
    resendId:
      data.id,

    quotaCounted:
      counted,
  };
}


/* =====================================================
   ENSURE BOTH EMAILS
===================================================== */

export async function ensureAppointmentEmails(
  row:
    AppointmentAutomationRow
) {
  const customer =
    await loadBusiness(
      row.site_id
    );


  if (
    !customer
  ) {
    return;
  }


  /* ---------------- REMINDER ---------------- */

  const reminderResult =
    await ensureOneEmail({
      row,

      customer,

      kind:
        "reminder",

      sendAt:
        new Date(
          row.reminder_at
        ),

      currentResendId:
        row.reminder_resend_id,

      quotaCounted:
        row.reminder_quota_counted,
    });


  const {
    error:
      reminderUpdateError,
  } =
    await supabase
      .from(
        "booking_appointments"
      )
      .update({
        reminder_resend_id:
          reminderResult
            .resendId,

        reminder_quota_counted:
          reminderResult
            .quotaCounted,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "event_uid",
        row.event_uid
      );


  if (
    reminderUpdateError
  ) {
    console.error(
      "Could not save reminder scheduling state:",
      reminderUpdateError
    );
  }


  /*
   * Keep the local row current before processing review.
   */
  row.reminder_resend_id =
    reminderResult
      .resendId;

  row.reminder_quota_counted =
    reminderResult
      .quotaCounted;


  /* ---------------- REVIEW ---------------- */

  const reviewResult =
    await ensureOneEmail({
      row,

      customer,

      kind:
        "review",

      sendAt:
        new Date(
          row.review_at
        ),

      currentResendId:
        row.review_resend_id,

      quotaCounted:
        row.review_quota_counted,
    });


  const {
    error:
      reviewUpdateError,
  } =
    await supabase
      .from(
        "booking_appointments"
      )
      .update({
        review_resend_id:
          reviewResult
            .resendId,

        review_quota_counted:
          reviewResult
            .quotaCounted,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "event_uid",
        row.event_uid
      );


  if (
    reviewUpdateError
  ) {
    console.error(
      "Could not save review scheduling state:",
      reviewUpdateError
    );
  }
}


/* =====================================================
   CONFIRMED / RESCHEDULED APPOINTMENT
===================================================== */

export async function syncConfirmedAppointment(
  input:
    ConfirmedAppointmentInput
) {
  const appointmentAt =
    new Date(
      input.appointmentAt
    );


  if (
    Number.isNaN(
      appointmentAt.getTime()
    )
  ) {
    throw new Error(
      "Invalid appointment_at."
    );
  }


  const appointmentAtIso =
    appointmentAt
      .toISOString();


  const reminderAt =
    new Date(
      appointmentAt.getTime() -
      24 *
      60 *
      60 *
      1000
    );


  const reviewAt =
    new Date(
      appointmentAt.getTime() +
      REVIEW_AFTER_START_MS
    );


  /*
   * Load existing record so a confirmation click is
   * idempotent and rescheduling can replace old
   * scheduled emails.
   */
  const {
    data:
      existing,

    error:
      existingError,
  } =
    await supabase
      .from(
        "booking_appointments"
      )
      .select("*")
      .eq(
        "event_uid",
        input.eventUID
      )
      .maybeSingle();


  if (
    existingError
  ) {
    throw existingError;
  }


  let reminderResendId =
    existing
      ?.reminder_resend_id ??
    null;


  let reviewResendId =
    existing
      ?.review_resend_id ??
    null;


  let reminderQuotaCounted =
    existing
      ?.reminder_quota_counted ??
    false;


  let reviewQuotaCounted =
    existing
      ?.review_quota_counted ??
    false;


  const appointmentChanged =
    existing &&
    new Date(
      existing.appointment_at
    ).getTime() !==
      appointmentAt.getTime();


  /*
   * RESCHEDULE
   */
  if (
    appointmentChanged
  ) {
    const oldReminder =
      await prepareOldEmailForReplacement({
        resendId:
          reminderResendId,

        quotaCounted:
          reminderQuotaCounted,
      });


    reminderResendId =
      oldReminder
        .resendId;


    reminderQuotaCounted =
      oldReminder
        .quotaCounted;


    const oldReview =
      await prepareOldEmailForReplacement({
        resendId:
          reviewResendId,

        quotaCounted:
          reviewQuotaCounted,
      });


    reviewResendId =
      oldReview
        .resendId;


    reviewQuotaCounted =
      oldReview
        .quotaCounted;
  }


  const row:
    AppointmentAutomationRow =
      {
        event_uid:
          input.eventUID,

        site_id:
          input.siteId,

        customer_email:
          input.customerEmail,

        customer_name:
          input.customerName
            ?.trim() ||
          null,

        service:
          input.service,

        appointment_date:
          input.appointmentDate,

        appointment_time:
          input.appointmentTime,

        appointment_at:
          appointmentAtIso,

        reminder_at:
          reminderAt
            .toISOString(),

        review_at:
          reviewAt
            .toISOString(),

        reminder_resend_id:
          reminderResendId,

        review_resend_id:
          reviewResendId,

        reminder_quota_counted:
          reminderQuotaCounted,

        review_quota_counted:
          reviewQuotaCounted,
      };


  const {
    error:
      upsertError,
  } =
    await supabase
      .from(
        "booking_appointments"
      )
      .upsert(
        {
          ...row,

          updated_at:
            new Date()
              .toISOString(),
        },

        {
          onConflict:
            "event_uid",
        }
      );


  if (
    upsertError
  ) {
    throw upsertError;
  }


  /*
   * Schedule immediately if inside Resend's window.
   *
   * Otherwise daily cron will pick it up later.
   */
  await ensureAppointmentEmails(
    row
  );
}