import { NextResponse } from "next/server";
import {
  createPricing,
  PricingStoreError,
} from "@/app/lib/pricingStore";
import type {
  PricingData,
  PricingTemplateId,
} from "@/app/lib/pricingStore";

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

function validatePricingData(value: unknown): PricingData {
  if (!isRecord(value)) {
    throw new ValidationError("Missing or invalid pricing data.");
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
    throw new ValidationError("Please select a valid service preset.");
  }

  const currency = readString(
    value.currency,
    "Currency",
    3,
    true
  ).toUpperCase();

  if (!CURRENCIES.has(currency)) {
    throw new ValidationError("Please select a supported currency.");
  }

  /* ---------------- SERVICES AND PRICES ---------------- */

  if (!isRecord(value.pricing)) {
    throw new ValidationError("Missing pricing information.");
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

    // Preset IDs such as "hairsalon-0" and custom UUIDs are supported.
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
    value.contact === undefined ? {} : value.contact;

  if (!isRecord(rawContact)) {
    throw new ValidationError("Invalid contact information.");
  }

  const contact = {
    email: readString(rawContact.email, "Email", 254),
    phone: readString(rawContact.phone, "Phone number", 50),
    address: readString(rawContact.address, "Address", 500),
  };

  if (
    contact.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)
  ) {
    throw new ValidationError(
      "Please enter a valid email address."
    );
  }

  /* ---------------- LOGO ---------------- */

  // The creation form uploads to Supabase and sends logoUrl.
  const logoUrl = normalizeWebUrl(
    readString(value.logoUrl, "Logo URL", 2048),
    "Logo URL"
  );

  // Also support the resized embedded logo used by the edit form.
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
    readString(value.bookingUrl, "Booking link", 2048),
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
      return json({ error: "Invalid JSON request." }, 400);
    }

    if (!isRecord(body)) {
      return json({ error: "Invalid request." }, 400);
    }

    const requestId = readString(
      body.requestId,
      "Creation request ID",
      36,
      true
    );

    if (!UUID_PATTERN.test(requestId)) {
      return json(
        { error: "Invalid creation request ID." },
        400
      );
    }

    const data = validatePricingData(body.data);

    // The store generates the page ID and private edit token.
    // Repeated requests with the same requestId and data
    // return the same links instead of creating duplicate pages.
    const result = await createPricing(data, requestId);

	return json({
	  success: true,
	  persisted: true,
	  siteId: result.siteId,
	  editToken: result.editToken,
	  subdomain: result.subdomain,
	});
  } catch (error) {
    if (error instanceof ValidationError) {
      return json({ error: error.message }, 400);
    }

    if (error instanceof PricingStoreError) {
      return json(
        { error: error.message },
        error.status
      );
    }

    // Do not log request bodies or private edit tokens.
    console.error("Unexpected pricing page creation failure.");

    return json(
      { error: "Could not create your pricing page. Please try again." },
      500
    );
  }
}