import "server-only";

import { resend } from "@/app/lib/resend";
import { supabaseAdmin } from "@/app/lib/supabase";

export type MeteredEmailType =
  | "booking"
  | "instant_quote"
  | "appointment_reminder"
  | "review_request"
  | "other";

export type ResendEmailPayload =
  Parameters<typeof resend.emails.send>[0];

type ReserveQuotaSuccess = {
  allowed: true;
  duplicate: boolean;
  batchId: string;
  status: "reserved" | "sent" | "partial";
  used?: number;
  limit?: number;
  remaining?: number;
  required?: number;
  unitsReserved?: number;
  unitsSent?: number;
  periodStartedAt?: string;
  periodEndsAt?: string;
};

type ReserveQuotaFailure = {
  allowed: false;
  duplicate: boolean;
  status?: "failed";
  used?: number;
  limit?: number;
  remaining?: number;
  required?: number;
  periodStartedAt?: string;
  periodEndsAt?: string;
};

export type ReserveQuotaResult =
  | ReserveQuotaSuccess
  | ReserveQuotaFailure;

export type SendReservedEmailsResult = {
  allSent: boolean;
  partiallySent: boolean;
  unitsReserved: number;
  unitsSent: number;
  resendIds: string[];
  errors: string[];
  trackingFinalized: boolean;
};

function countAddresses(value: unknown): number {
  if (!value) {
    return 0;
  }

  if (typeof value === "string") {
    return value.trim() ? 1 : 0;
  }

  if (Array.isArray(value)) {
    return value.filter(
      (item) =>
        typeof item === "string" &&
        item.trim().length > 0
    ).length;
  }

  return 0;
}

/**
 * Counts recipient email units.
 *
 * One email sent to:
 * - 1 To recipient = 1 unit
 * - 1 To + 1 CC = 2 units
 * - 2 To recipients = 2 units
 */
export function countEmailUnits(
  emails: ResendEmailPayload[]
): number {
  return emails.reduce((total, email) => {
    const emailRecord = email as Record<string, unknown>;

    return (
      total +
      countAddresses(emailRecord.to) +
      countAddresses(emailRecord.cc) +
      countAddresses(emailRecord.bcc)
    );
  }, 0);
}

function safeTagValue(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 256);
}

function errorToString(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown email error";
  }
}

/**
 * Atomically reserves quota before any permanent booking or
 * quote action is performed.
 */
export async function reserveEmailQuota({
  siteId,
  emailType,
  idempotencyKey,
  units,
}: {
  siteId: string;
  emailType: MeteredEmailType;
  idempotencyKey: string;
  units: number;
}): Promise<ReserveQuotaResult> {
  if (!siteId) {
    throw new Error("siteId is required");
  }

  if (!idempotencyKey) {
    throw new Error("idempotencyKey is required");
  }

  if (!Number.isInteger(units) || units < 1) {
    throw new Error(
      "Email quota units must be a positive integer"
    );
  }

  const { data, error } = await supabaseAdmin.rpc(
    "reserve_site_email_batch",
    {
      p_site_id: siteId,
      p_units: units,
      p_email_type: emailType,
      p_idempotency_key: idempotencyKey.slice(0, 256),
    }
  );

  if (error) {
    console.error("Could not reserve email quota:", error);

    throw new Error(
      `Could not reserve email quota: ${error.message}`
    );
  }

  if (!data || typeof data !== "object") {
    throw new Error(
      "Supabase returned an invalid email quota response"
    );
  }

  return data as ReserveQuotaResult;
}

/**
 * Finalizes a quota reservation.
 *
 * If fewer emails were accepted by Resend than were reserved,
 * the unused units are returned to the site's quota.
 */
export async function finalizeEmailQuota({
  batchId,
  unitsSent,
  resendIds,
  errorMessage,
}: {
  batchId: string;
  unitsSent: number;
  resendIds: string[];
  errorMessage: string | null;
}): Promise<void> {
  const { error } = await supabaseAdmin.rpc(
    "finalize_site_email_batch",
    {
      p_batch_id: batchId,
      p_units_sent: unitsSent,
      p_resend_email_ids: resendIds,
      p_error_message: errorMessage,
    }
  );

  if (error) {
    throw new Error(
      `Could not finalize email quota: ${error.message}`
    );
  }
}

/**
 * Send emails that already have a quota reservation.
 *
 * This uses individual Resend calls instead of Resend Batch
 * because booking emails may contain an .ics attachment.
 */
export async function sendReservedEmails({
  siteId,
  emailType,
  idempotencyKey,
  batchId,
  unitsReserved,
  emails,
}: {
  siteId: string;
  emailType: MeteredEmailType;
  idempotencyKey: string;
  batchId: string;
  unitsReserved: number;
  emails: ResendEmailPayload[];
}): Promise<SendReservedEmailsResult> {
  let unitsSent = 0;

  const resendIds: string[] = [];
  const errors: string[] = [];

  for (let index = 0; index < emails.length; index += 1) {
    const email = emails[index];

    const emailUnits = countEmailUnits([email]);

    try {
      const existingTags =
        "tags" in email && Array.isArray(email.tags)
          ? email.tags
          : [];

      const payload = {
        ...email,

        tags: [
          ...existingTags,

          {
            name: "site_id",
            value: safeTagValue(siteId),
          },

          {
            name: "email_type",
            value: safeTagValue(emailType),
          },
        ],
      } as ResendEmailPayload;

      const { data, error } = await resend.emails.send(
        payload,
        {
          idempotencyKey:
            `${idempotencyKey}/${index}`.slice(0, 256),
        }
      );

      if (error) {
        errors.push(errorToString(error));
        continue;
      }

      if (!data?.id) {
        errors.push(
          `Resend did not return an email ID for email ${index}`
        );

        continue;
      }

      resendIds.push(data.id);
      unitsSent += emailUnits;
    } catch (error) {
      errors.push(errorToString(error));
    }
  }

  let trackingFinalized = true;

  try {
    await finalizeEmailQuota({
      batchId,
      unitsSent,
      resendIds,
      errorMessage:
        errors.length > 0
          ? errors.join(" | ")
          : null,
    });
  } catch (error) {
    trackingFinalized = false;

    console.error(
      "Emails were processed, but quota finalization failed:",
      error
    );
  }

  return {
    allSent: unitsSent === unitsReserved,
    partiallySent:
      unitsSent > 0 && unitsSent < unitsReserved,

    unitsReserved,
    unitsSent,
    resendIds,
    errors,
    trackingFinalized,
  };
}

/**
 * Use this when a booking operation fails after quota was
 * reserved but before any email was sent.
 */
export async function releaseEntireEmailReservation({
  batchId,
  reason,
}: {
  batchId: string;
  reason: string;
}): Promise<void> {
  await finalizeEmailQuota({
    batchId,
    unitsSent: 0,
    resendIds: [],
    errorMessage: reason,
  });
}

export async function getEmailQuotaStatus(
  siteId: string
): Promise<{
  siteId: string;
  used: number;
  limit: number;
  remaining: number;
  limitReached: boolean;
  periodStartedAt: string;
  periodEndsAt: string;
}> {
  const { data, error } = await supabaseAdmin.rpc(
    "get_site_email_quota_status",
    {
      p_site_id: siteId,
    }
  );

  if (error) {
    throw new Error(
      `Could not read email quota: ${error.message}`
    );
  }

  return data;
}