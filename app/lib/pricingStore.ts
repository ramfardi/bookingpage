import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import { getSiteFromHost } from "./getSiteFromHost";
import { getSiteCleaningQuote } from "./getSiteCleaningQuote";
import { getCustomerServer } from "./getCustomerServer";

/* ---------------- TYPES ---------------- */

export type PricingTemplateId =
  | "hairsalon"
  | "cleaning"
  | "beauty"
  | "fitness"
  | "home"
  | "auto"
  | "accounting"
  | "pet"
  | "photo"
  | "custom";

export type PricingRow = {
  id: string;
  name: string;
  price: string;
  description?: string;
};

export type PricingContact = {
  email: string;
  phone: string;
  address: string;
};

export type PricingData = {
  businessName: string;
  templateId: PricingTemplateId;
  currency: string;

  pricing: {
    title: string;
    rows: PricingRow[];
  };

  contact: PricingContact;

  logoUrl: string;
  logoDataUrl?: string;

  bookingUrl: string;
  notes: string;
};

export type CreatePricingResult = {
  siteId: string;
  editToken: string;
  subdomain: string;
};

export class PricingStoreError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500
  ) {
    super(message);
    this.name = "PricingStoreError";
  }
}

/* ---------------- SUPABASE ---------------- */

// Initialize only when needed, rather than during module import.
// This module must never be imported into a client component.

function getPricingSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL1 ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new PricingStoreError(
      "Pricing storage is not configured."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

const TABLE = "pricing_sites";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ---------------- HELPERS ---------------- */

// Copy only supported fields and preserve both logo formats.
// Runtime validation of incoming requests belongs in the API routes.
function copyPricingData(data: PricingData): PricingData {
  return {
    businessName: data.businessName,
    templateId: data.templateId,
    currency: data.currency,

    pricing: {
      title: data.pricing.title,
      rows: data.pricing.rows.map((row) => ({
        id: row.id,
        name: row.name,
        price: row.price,
		description: row.description ?? "",
      })),
    },

    contact: {
      email: data.contact.email,
      phone: data.contact.phone,
      address: data.contact.address,
    },

    logoUrl: data.logoUrl ?? "",
    logoDataUrl: data.logoDataUrl ?? "",

    bookingUrl: data.bookingUrl ?? "",
    notes: data.notes ?? "",
  };
}

function hashData(data: PricingData): string {
  return createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
}

/* ---------------- CREATE ---------------- */


const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "support",
  "mail",
  "email",
  "smtp",
  "help",
  "docs",
  "status",
  "blog",
  "dashboard",
  "pricing",
  "availability",
]);

function sanitizePricingSubdomain(value: string): string {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");

  const base = cleaned || "business";

  return RESERVED_SUBDOMAINS.has(base)
    ? `${base}-pricing`
    : base;
}

async function isPricingSubdomainTaken(
  subdomain: string
): Promise<boolean> {
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return true;
  }

  const supabase = getPricingSupabase();

  const { data, error } = await supabase
    .from(TABLE)
    .select("site_id")
    .eq("subdomain", subdomain)
    .maybeSingle();

  if (error) {
    throw new PricingStoreError(
      "Could not check the pricing page address. Please try again."
    );
  }

  if (data) {
    return true;
  }

  // Check the other page types that share the same domain.
  const host = `${subdomain}.simplebookme.com`;

  const [availability, cleaningQuote, bookingWebsite] =
    await Promise.all([
      getSiteFromHost(host),
      getSiteCleaningQuote(host),
      getCustomerServer(host),
    ]);

  return Boolean(
    availability || cleaningQuote || bookingWebsite
  );
}

/**
 * Creates a pricing page.
 *
 * requestId comes from the creation form's crypto.randomUUID().
 * Reusing the same requestId and original data returns the same links.
 * This prevents duplicate pages if a successful response is lost.
 *
 * The API must validate incoming data before calling this function.
 */
export async function createPricing(
  data: PricingData,
  requestId: string
): Promise<CreatePricingResult> {
  if (!UUID_PATTERN.test(requestId)) {
    throw new PricingStoreError(
      "A valid creation request ID is required.",
      400
    );
  }

  const supabase = getPricingSupabase();
  const savedData = copyPricingData(data);
  const requestHash = hashData(savedData);

  async function getExistingRequest():
    Promise<CreatePricingResult | null> {
    const { data: existing, error } = await supabase
      .from(TABLE)
      .select(
        "site_id, edit_token, subdomain, request_hash"
      )
      .eq("request_id", requestId)
      .maybeSingle();

    if (error) {
      throw new PricingStoreError(
        "Could not check your creation request. Please retry."
      );
    }

    if (!existing) {
      return null;
    }

    if (existing.request_hash !== requestHash) {
      throw new PricingStoreError(
        "This request ID was already used with different pricing data.",
        409
      );
    }

    return {
      siteId: existing.site_id,
      editToken: existing.edit_token,
      subdomain: existing.subdomain,
    };
  }

  // Recover the same links if a previous response was lost.
  const existing = await getExistingRequest();

  if (existing) {
    return existing;
  }

  const base = sanitizePricingSubdomain(
    savedData.businessName
  );

  const siteId = randomUUID();
  const editToken = randomBytes(32).toString("hex");

  for (let attempt = 0; attempt < 10; attempt++) {
    // First try the business name.
    // If taken, add a short random suffix.
    const subdomain =
      attempt === 0
        ? base
        : `${base}-${randomBytes(3).toString("hex")}`;

    if (await isPricingSubdomainTaken(subdomain)) {
      continue;
    }

    const { error } = await supabase
      .from(TABLE)
      .insert({
        site_id: siteId,
        edit_token: editToken,
        subdomain,
        request_id: requestId,
        request_hash: requestHash,
        data: savedData,
      });

    if (!error) {
      return {
        siteId,
        editToken,
        subdomain,
      };
    }

    if (error.code === "23505") {
      // Another identical request may have completed meanwhile.
      const recovered = await getExistingRequest();

      if (recovered) {
        return recovered;
      }

      // Otherwise another pricing page may have claimed this name.
      // Retry with a different suffix.
      continue;
    }

    throw new PricingStoreError(
      "Could not create your pricing page."
    );
  }

  throw new PricingStoreError(
    "Could not assign an available page address. Please try again.",
    409
  );
}

/* ---------------- PUBLIC READ ---------------- */

/**
 * Used by app/pricing_page/[siteId]/page.tsx.
 *
 * Returns only public pricing data.
 * Never returns the private edit token or creation request ID.
 */
export async function getPricing(
  siteId: string
): Promise<PricingData | null> {
  if (!UUID_PATTERN.test(siteId)) {
    return null;
  }

  const supabase = getPricingSupabase();

  const { data: record, error } = await supabase
    .from(TABLE)
    .select("data")
    .eq("site_id", siteId)
    .maybeSingle();

  if (error) {
    throw new PricingStoreError(
      "Could not load the pricing page."
    );
  }

  if (!record) {
    return null;
  }

  return record.data as PricingData;
}

/* ---------------- AUTHORIZED EDIT READ ---------------- */

/**
 * Used by GET /api/pricing/get?siteId=...&token=...
 *
 * Authorization is checked in the database query.
 * A missing page and an incorrect token both return null.
 */
export async function getPricingForEdit(
  siteId: string,
  editToken: string
): Promise<PricingData | null> {
  if (
    !UUID_PATTERN.test(siteId) ||
    !/^[0-9a-f]{64}$/.test(editToken)
  ) {
    return null;
  }

  const supabase = getPricingSupabase();

  const { data: record, error } = await supabase
    .from(TABLE)
    .select("data")
    .eq("site_id", siteId)
    .eq("edit_token", editToken)
    .maybeSingle();

  if (error) {
    throw new PricingStoreError(
      "Could not load the pricing page for editing."
    );
  }

  if (!record) {
    return null;
  }

  return record.data as PricingData;
}

/* ---------------- UPDATE ---------------- */

/**
 * Used by POST /api/pricing/update.
 *
 * Accepts the complete validated data object from the edit form.
 * Both logo fields are included so existing logos are preserved,
 * while empty strings explicitly remove them.
 *
 * Returns false if the page does not exist or the token is wrong.
 */
export async function updatePricing(
  siteId: string,
  editToken: string,
  data: PricingData
): Promise<boolean> {
  if (
    !UUID_PATTERN.test(siteId) ||
    !/^[0-9a-f]{64}$/.test(editToken)
  ) {
    return false;
  }

  const supabase = getPricingSupabase();
  const savedData = copyPricingData(data);

  // Check authorization and perform the write in one query.
  const { data: record, error } = await supabase
    .from(TABLE)
    .update({
      data: savedData,
      updated_at: new Date().toISOString(),
    })
    .eq("site_id", siteId)
    .eq("edit_token", editToken)
    .select("site_id")
    .maybeSingle();

  if (error) {
    throw new PricingStoreError(
      "Your changes could not be saved. Please try again."
    );
  }

  return Boolean(record);
}

export async function getPricingBySubdomain(
  subdomain: string
): Promise<{
  siteId: string;
  subdomain: string;
  data: PricingData;
} | null> {
  const cleaned = subdomain.trim().toLowerCase();

  if (
    !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(cleaned)
  ) {
    return null;
  }

  const supabase = getPricingSupabase();

  const { data: record, error } = await supabase
    .from(TABLE)
    .select("site_id, subdomain, data")
    .eq("subdomain", cleaned)
    .maybeSingle();

  if (error) {
    throw new PricingStoreError(
      "Could not load the pricing page."
    );
  }

  if (!record) {
    return null;
  }

  return {
    siteId: record.site_id,
    subdomain: record.subdomain,
    data: record.data as PricingData,
  };
}