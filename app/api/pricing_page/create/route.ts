
import { NextResponse } from "next/server";
import {
  createPricing,
  PricingStoreError,
} from "@/app/lib/pricingStore";
import type {
  PricingData,
  PricingTemplateId,
} from "@/app/lib/pricingStore";

// Billing system shared with Cleaning Quote
import { registerProduct } from "@/app/lib/billing/registerProduct";
import { sendProductLinks } from "@/app/lib/billing/sendLinks";
import { getBillingDb } from "@/app/lib/billing/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "private, no-store",
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: noCacheHeaders,
  });
}

class ValidationError extends Error {}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readString(
  value: unknown,
  label: string,
  maxLength: number,
  required = false
): string {
  if (value === undefined && !required) {
    return "";
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${label} must be text.`);
  }

  if (value.length > maxLength) {
    throw new ValidationError(
      `${label} must be ${maxLength} characters or fewer.`
    );
  }

  const trimmed = value.trim();

  if (required && !trimmed) {
    throw new ValidationError(`${label} is required.`);
  }

  return trimmed;
}

function normalizeWebUrl(
  value: string,
  label: string
): string {
  if (!value) return "";

  if (
    /^[a-z][a-z0-9+.-]*:/i.test(value) &&
    !/^https?:\/\//i.test(value)
  ) {
    throw new ValidationError(
      `${label} must use HTTP or HTTPS.`
    );
  }

  let url: URL;

  try {
    url = new URL(
      /^https?:\/\//i.test(value)
        ? value
        : `https://${value}`
    );
  } catch {
    throw new ValidationError(
      `Please enter a valid ${label.toLowerCase()}.`
    );
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    !url.hostname.includes(".") ||
    url.username ||
    url.password
  ) {
    throw new ValidationError(
      `Please enter a valid ${label.toLowerCase()}.`
    );
  }

  if (url.href.length > 2048) {
    throw new ValidationError(`${label} is too long.`);
  }

  return url.href;
}

const TEMPLATE_IDS: readonly PricingTemplateId[] = [
  "hairsalon",
  "cleaning",
  "beauty",
  "fitness",
  "home",
  "auto",
  "accounting",
  "pet",
  "photo",
  "custom",
];

const CURRENCIES = new Set([
  "CAD",
  "USD",
  "GBP",
  "EUR",
  "AUD",
  "NZD",
  "ZAR",
  "PHP",
  "SGD",
  "INR",
  "AED",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------------- VALIDATION ---------------- */

function validatePricingData(
  value: unknown
): PricingData {
  if (!isRecord(value)) {
    throw new ValidationError(
      "Missing or invalid pricing data."
    );
  }

  const businessName = readString(
    value.businessName,
    "Business name",
    120,
    true
  );

  const templateId = TEMPLATE_IDS.find(
    (id) => id === value.templateId
  );

  if (!templateId) {
    throw new ValidationError(
      "Please select a valid service preset."
    );
  }

  const currency = readString(
    value.currency,
    "Currency",
    3,
    true
  ).toUpperCase();

  if (!CURRENCIES.has(currency)) {
    throw new ValidationError(
      "Please select a supported currency."
    );
  }

  /* ---------------- SERVICES AND PRICES ---------------- */

  if (!isRecord(value.pricing)) {
    throw new ValidationError(
      "Missing pricing information."
    );
  }

  const title = readString(
    value.pricing.title,
    "Price list heading",
    100,
    true
  );

  const rawRows = value.pricing.rows;

  if (
    !Array.isArray(rawRows) ||
    rawRows.length === 0 ||
    rawRows.length > 200
  ) {
    throw new ValidationError(
      "Your pricing page must contain between 1 and 200 services."
    );
  }

  const usedIds = new Set<string>();

  const rows = rawRows.map((row, index) => {
    if (!isRecord(row)) {
      throw new ValidationError(
        `Service ${index + 1} is invalid.`
      );
    }

    const id = readString(
      row.id,
      `Service ${index + 1} ID`,
      100,
      true
    );

    if (usedIds.has(id)) {
      throw new ValidationError(
        "Each service must have a unique ID."
      );
    }

    usedIds.add(id);

    return {
      id,
      name: readString(
        row.name,
        `Service ${index + 1} name`,
        160,
        true
      ),
      price: readString(
        row.price,
        `Service ${index + 1} price`,
        100,
        true
      ),
      description: readString(
        row.description,
        `Service ${index + 1} notes`,
        500
      ),
    };
  });

  /* ---------------- CONTACT ---------------- */

  const rawContact =
    value.contact === undefined
      ? {}
      : value.contact;

  if (!isRecord(rawContact)) {
    throw new ValidationError(
      "Invalid contact information."
    );
  }

  // NEW: Email is required for trial registration.
  const contact = {
    email: readString(
      rawContact.email,
      "Email",
      254,
      true
    ).toLowerCase(),

    phone: readString(
      rawContact.phone,
      "Phone number",
      50
    ),

    address: readString(
      rawContact.address,
      "Address",
      500
    ),
  };

  if (!EMAIL_PATTERN.test(contact.email)) {
    throw new ValidationError(
      "Please enter a valid email address to receive your pricing page links."
    );
  }

  /* ---------------- LOGO ---------------- */

  const logoUrl = normalizeWebUrl(
    readString(
      value.logoUrl,
      "Logo URL",
      2048
    ),
    "Logo URL"
  );

  const logoDataUrl = readString(
    value.logoDataUrl,
    "Logo image",
    350_000
  );

  if (
    logoDataUrl &&
    !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
      logoDataUrl
    )
  ) {
    throw new ValidationError(
      "Invalid logo. Please select a JPG, PNG, or WebP image."
    );
  }

  /* ---------------- BOOKING AND NOTES ---------------- */

  const bookingUrl = normalizeWebUrl(
    readString(
      value.bookingUrl,
      "Booking link",
      2048
    ),
    "Booking link"
  );

  const notes = readString(
    value.notes,
    "Pricing notes",
    2000
  );

  return {
    businessName,
    templateId,
    currency,
    pricing: {
      title,
      rows,
    },
    contact,
    logoUrl,
    logoDataUrl,
    bookingUrl,
    notes,
  };
}

/* ---------------- CREATE ---------------- */

export async function POST(req: Request) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return json(
        { error: "Invalid JSON request." },
        400
      );
    }

    if (!isRecord(body)) {
      return json(
        { error: "Invalid request." },
        400
      );
    }

    const requestId = readString(
      body.requestId,
      "Creation request ID",
      36,
      true
    );

    if (!UUID_PATTERN.test(requestId)) {
      return json(
        {
          error: "Invalid creation request ID.",
        },
        400
      );
    }

    const data = validatePricingData(body.data);

    const ownerEmail = data.contact.email;

    /* -------- STEP 1: SAVE PRICING PAGE -------- */

    // Keep existing storage and retry protection.
    // The store generates siteId, editToken and subdomain.
    const result = await createPricing(
      data,
      requestId
    );

    /* -------- STEP 2: REGISTER FREE TRIAL -------- */

    let billing: Awaited<
      ReturnType<typeof registerProduct>
    >;

    try {
      billing = await registerProduct({
        productKey: "pricing_page",
        resourceId: result.siteId,
        email: ownerEmail,
      });
    } catch {
      console.error(
        "Pricing page saved, but billing registration failed."
      );

      // Do not create a second pricing page.
      // A retry with the same requestId should recover it.
      return json(
        {
          error:
            "Your pricing page was saved, but trial setup could not be completed. Please retry without changing your form.",
          retryable: true,
        },
        503
      );
    }

    /* -------- STEP 3: CREATE LINKS -------- */

    const appOrigin =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      new URL(req.url).origin;

    const publicUrl =
      `https://${result.subdomain}.simplebookme.com`;

    const editUrl = new URL(
      `/pricing_page/${encodeURIComponent(result.siteId)}/edit`,
      appOrigin
    );

    editUrl.searchParams.set(
      "token",
      result.editToken
    );

    const privateUrl = editUrl.toString();

    const activationUrl = billing.activationUrl;

    /* -------- STEP 4: WELCOME EMAIL -------- */

    let emailSent = false;
    let emailWarning = "";

    try {
      const db = getBillingDb();

      // Look up whether we already emailed the owner.
      // This avoids resending on normal creation retries.
      const {
        data: activationRow,
        error: lookupError,
      } = await db
        .from("product_activations")
        .select("id, welcome_email_sent_at")
        .eq("product_key", "pricing_page")
        .eq("resource_id", result.siteId)
        .maybeSingle();

      if (lookupError || !activationRow) {
        throw new Error(
          "Could not verify welcome email status."
        );
      }

      if (activationRow.welcome_email_sent_at) {
        // The email was already accepted previously.
        emailSent = true;
      } else {
        await sendProductLinks({
          productKey: "pricing_page",
          email: ownerEmail,
          businessName: data.businessName,
          publicUrl,
          privateUrl,
          activationUrl,
          trialEndsAt: billing.trialEndsAt,
        });

        // Resend accepted the email.
        emailSent = true;

        const { error: updateError } = await db
          .from("product_activations")
          .update({
            welcome_email_sent_at:
              new Date().toISOString(),
          })
          .eq("id", activationRow.id)
          .is("welcome_email_sent_at", null);

        if (updateError) {
          // The page and email still succeeded.
          // Log without printing any private tokens.
          console.error(
            "Pricing welcome email sent, but status update failed."
          );
        }
      }
    } catch {
      console.error(
        "Pricing page created, but welcome email failed."
      );

      emailWarning =
        "Your pricing page was created, but the email could not be sent. Please save your links.";
    }

    /* -------- STEP 5: RETURN RESULT -------- */

    return json({
      success: true,
      persisted: true,

      // Existing fields: retained for frontend compatibility
      siteId: result.siteId,
      editToken: result.editToken,
      subdomain: result.subdomain,

      // New URLs
      publicUrl,
      editUrl: privateUrl,
      activationUrl,

      // New billing information
      trialStartedAt: billing.trialStartedAt,
      trialEndsAt: billing.trialEndsAt,

      // Welcome email status
      emailSent,
      emailWarning,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return json(
        { error: error.message },
        400
      );
    }

    if (error instanceof PricingStoreError) {
      return json(
        { error: error.message },
        error.status
      );
    }

    // Never log request bodies or private edit tokens.
    console.error(
      "Unexpected pricing page creation failure."
    );

    return json(
      {
        error:
          "Could not create your pricing page. Please try again.",
      },
      500
    );
  }
}
