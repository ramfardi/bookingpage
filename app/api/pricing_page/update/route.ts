import { NextResponse } from "next/server";
import {
  getPricingForEdit,
  updatePricing,
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

/* ---------------- VALIDATE AND MERGE ---------------- */

function buildUpdatedData(
  input: Record<string, unknown>,
  current: PricingData
): PricingData {
  // Omitted fields retain their saved values.
  // Empty strings explicitly clear optional text fields.
  const businessName = readString(
    input.businessName === undefined
      ? current.businessName
      : input.businessName,
    "Business name",
    120,
    true
  );

  const rawTemplateId =
    input.templateId === undefined
      ? current.templateId
      : input.templateId;

  const templateId = TEMPLATE_IDS.find(
    (id) => id === rawTemplateId
  );

  if (!templateId) {
    throw new ValidationError("Please select a valid service preset.");
  }

  const currency = readString(
    input.currency === undefined
      ? current.currency
      : input.currency,
    "Currency",
    3,
    true
  ).toUpperCase();

  if (!CURRENCIES.has(currency)) {
    throw new ValidationError("Please select a supported currency.");
  }

  /* ---------------- PRICING ---------------- */

  if (
    input.pricing !== undefined &&
    !isRecord(input.pricing)
  ) {
    throw new ValidationError("Invalid pricing information.");
  }

  const pricing = isRecord(input.pricing) ? input.pricing : {};

  const title = readString(
    pricing.title === undefined
      ? current.pricing.title
      : pricing.title,
    "Price list heading",
    100,
    true
  );

  const rawRows =
    pricing.rows === undefined
      ? current.pricing.rows
      : pricing.rows;

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

  // A supplied rows array replaces the previous list completely.
  // This makes service additions and removals persist correctly.
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
    };
  });

  /* ---------------- CONTACT ---------------- */

  if (
    input.contact !== undefined &&
    !isRecord(input.contact)
  ) {
    throw new ValidationError("Invalid contact information.");
  }

  const rawContact = isRecord(input.contact) ? input.contact : {};

  const contact = {
    email: readString(
      rawContact.email === undefined
        ? current.contact.email
        : rawContact.email,
      "Email",
      254
    ),
    phone: readString(
      rawContact.phone === undefined
        ? current.contact.phone
        : rawContact.phone,
      "Phone number",
      50
    ),
    address: readString(
      rawContact.address === undefined
        ? current.contact.address
        : rawContact.address,
      "Address",
      500
    ),
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

  // Preserve omitted logo fields.
  // The edit page sends both as "" when removing a logo.
  const logoUrl = normalizeWebUrl(
    readString(
      input.logoUrl === undefined
        ? current.logoUrl
        : input.logoUrl,
      "Logo URL",
      2048
    ),
    "Logo URL"
  );

  const logoDataUrl = readString(
    input.logoDataUrl === undefined
      ? current.logoDataUrl
      : input.logoDataUrl,
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
      input.bookingUrl === undefined
        ? current.bookingUrl
        : input.bookingUrl,
      "Booking link",
      2048
    ),
    "Booking link"
  );

  const notes = readString(
    input.notes === undefined ? current.notes : input.notes,
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

/* ---------------- UPDATE ---------------- */

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

    if (
      typeof body.siteId !== "string" ||
      !UUID_PATTERN.test(body.siteId.trim())
    ) {
      return json({ error: "Missing or invalid siteId." }, 400);
    }

    if (
      typeof body.editToken !== "string" ||
      !body.editToken.trim()
    ) {
      return json({ error: "Missing edit token." }, 401);
    }

    const siteId = body.siteId.trim();
    const editToken = body.editToken.trim();

    // Authenticate before loading or merging saved information.
    const current = await getPricingForEdit(siteId, editToken);

    if (!current) {
      return json(
        {
          error:
            "This edit link is invalid or the pricing page no longer exists.",
        },
        404
      );
    }

    if (!isRecord(body.data)) {
      return json(
        { error: "Missing or invalid pricing data." },
        400
      );
    }

    const updatedData = buildUpdatedData(body.data, current);

    // The store checks the token again as part of the update query.
    // Success is returned only after Supabase confirms the write.
    const saved = await updatePricing(
      siteId,
      editToken,
      updatedData
    );

    if (!saved) {
      return json(
        {
          error:
            "This edit link is invalid or the pricing page no longer exists.",
        },
        404
      );
    }

    return json({
      success: true,
      persisted: true,
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

    // Do not log private tokens or request bodies.
    console.error("Unexpected pricing page update failure.");

    return json(
      { error: "Could not save your changes. Please try again." },
      500
    );
  }
}