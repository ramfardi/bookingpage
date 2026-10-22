import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

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

  const siteId = randomUUID();
  const editToken = randomBytes(32).toString("hex");

  // Ignore an existing request ID instead of overwriting its page.
  const { error: insertError } = await supabase
    .from(TABLE)
    .upsert(
      {
        site_id: siteId,
        edit_token: editToken,
        request_id: requestId,
        request_hash: requestHash,
        data: savedData,
      },
      {
        onConflict: "request_id",
        ignoreDuplicates: true,
      }
    );

  if (insertError) {
    throw new PricingStoreError(
      "Could not create your pricing page."
    );
  }

  const { data: record, error: readError } = await supabase
    .from(TABLE)
    .select("site_id, edit_token, request_hash")
    .eq("request_id", requestId)
    .maybeSingle();

  if (readError || !record) {
    throw new PricingStoreError(
      "Could not retrieve your pricing page links. Please retry."
    );
  }

  if (record.request_hash !== requestHash) {
    throw new PricingStoreError(
      "This request ID was already used with different pricing data.",
      409
    );
  }

  return {
    siteId: record.site_id,
    editToken: record.edit_token,
  };
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