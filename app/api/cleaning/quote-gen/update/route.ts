
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JsonObject = Record<string, unknown>;

const DEFAULT_RATES = {
  apartment: 0.12,
  townhouse: 0.14,
  house: 0.16,
  commercial: 0.18,
};

const DEFAULT_SERVICES = {
  standard: 1,
  deep: 1.5,
  move: 1.7,
};

const DEFAULT_CONDITIONS = {
  normal: 1,
  moderate: 1.15,
  heavy: 1.3,
};

const DEFAULT_FREQUENCY = {
  once: 0,
  weekly: 15,
  biweekly: 10,
  monthly: 5,
};

const DEFAULT_EXTRAS = {
  oven: 30,
  fridge: 25,
  windows: 40,
  petHair: 20,
};

const noCacheHeaders = {
  "Cache-Control": "private, no-store",
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: noCacheHeaders,
  });
}

function isObject(value: unknown): value is JsonObject {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function text(
  value: unknown,
  field: string,
  maxLength: number
): string {
  if (value == null) return "";

  if (typeof value !== "string") {
    throw new Error(`Invalid ${field}.`);
  }

  const result = value.trim();

  if (result.length > maxLength) {
    throw new Error(`${field} is too long.`);
  }

  return result;
}

function amount(
  value: unknown,
  fallback: number,
  max: number,
  field: string
): number {
  if (value === undefined || value === null) {
    return fallback;
  }

  const result = Number(value);

  if (
    !Number.isFinite(result) ||
    result < 0 ||
    result > max
  ) {
    throw new Error(`Invalid ${field}.`);
  }

  return result;
}

function mergeNumbers<T extends Record<string, number>>(
  incoming: unknown,
  existing: unknown,
  defaults: T,
  max: number,
  field: string
): T {
  if (incoming !== undefined && !isObject(incoming)) {
    throw new Error(`Invalid ${field}.`);
  }

  const previous = isObject(existing) ? existing : {};
  const changes = isObject(incoming) ? incoming : {};
  const merged = { ...defaults };

  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const name = String(key);
    const previousValue = previous[name];

    const fallback =
      typeof previousValue === "number" &&
      Number.isFinite(previousValue) &&
      previousValue >= 0 &&
      previousValue <= max
        ? previousValue
        : defaults[key];

    merged[key] = amount(
      changes[name],
      fallback,
      max,
      `${field}.${name}`
    ) as T[typeof key];
  }

  return merged;
}

function webUrl(value: unknown, field: string): string {
  const raw = text(value, field, 2048);

  if (!raw) return "";

  try {
    const parsed = new URL(
      /^https?:\/\//i.test(raw)
        ? raw
        : `https://${raw}`
    );

    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password
    ) {
      throw new Error("Invalid URL");
    }

    return parsed.toString();
  } catch {
    throw new Error(`Please provide a valid ${field}.`);
  }
}

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  if (!isObject(body)) {
    return json({ error: "Invalid request body." }, 400);
  }

  const siteId = body.siteId;
  const editToken = body.editToken;

  if (
    typeof siteId !== "string" ||
    !/^[a-zA-Z0-9_-]{4,64}$/.test(siteId) ||
    typeof editToken !== "string" ||
    !/^[a-zA-Z0-9_-]{8,128}$/.test(editToken)
  ) {
    return json(
      { error: "Missing or invalid siteId or editToken." },
      400
    );
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL1;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "Cleaning quote UPDATE: Supabase configuration missing."
    );

    return json(
      { error: "Server configuration error." },
      500
    );
  }

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  try {
    // Retrieve current configuration.
    const { data: existing, error: fetchError } =
      await supabase
        .from("cleaning_quote_sites")
        .select("edit_token, data")
        .eq("site_id", siteId)
        .maybeSingle();

    if (fetchError) {
      console.error(
        "Cleaning quote UPDATE lookup error:",
        fetchError
      );

      return json(
        { error: "Unable to load this quote page." },
        500
      );
    }

    if (!existing) {
      return json({ error: "Quote not found." }, 404);
    }

    // Validate private edit token server-side.
    if (existing.edit_token !== editToken) {
      return json(
        { error: "Unauthorized edit link." },
        403
      );
    }

    // Preserve all existing data, including legacy fields.
    const saved: JsonObject = isObject(existing.data)
      ? { ...existing.data }
      : {};

    const updated: JsonObject = { ...saved };

    try {
      // BUSINESS NAME
      if (body.businessName !== undefined) {
        const name = text(
          body.businessName,
          "business name",
          100
        );

        if (!name) {
          throw new Error("Business name is required.");
        }

        updated.businessName = name;
      }

      // ORIGINAL PROPERTY PRICING
      if (body.pricePerSqft !== undefined) {
        updated.pricePerSqft = mergeNumbers(
          body.pricePerSqft,
          saved.pricePerSqft,
          DEFAULT_RATES,
          1000,
          "pricePerSqft"
        );
      }

      if (body.minimumPrice !== undefined) {
        updated.minimumPrice = amount(
          body.minimumPrice,
          80,
          1_000_000,
          "minimumPrice"
        );
      }

      // BUSINESS CONTACT
      if (body.businessEmail !== undefined) {
        const email = text(
          body.businessEmail,
          "business email",
          160
        );

        if (
          email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
          throw new Error(
            "Please provide a valid business email."
          );
        }

        updated.businessEmail = email;
      }

      if (body.businessPhone !== undefined) {
        updated.businessPhone = text(
          body.businessPhone,
          "business phone",
          40
        );
      }

      if (body.serviceArea !== undefined) {
        updated.serviceArea = text(
          body.serviceArea,
          "service area",
          140
        );
      }

      // CALENDAR AND BOOKING LINKS
      if (body.availabilityUrl !== undefined) {
        updated.availabilityUrl = webUrl(
          body.availabilityUrl,
          "availability link"
        );
      }

      if (body.bookingUrl !== undefined) {
        updated.bookingUrl = webUrl(
          body.bookingUrl,
          "booking link"
        );
      }

      // NEW CLEANING QUOTE SETTINGS
      if (body.quoteSettings !== undefined) {
        if (!isObject(body.quoteSettings)) {
          throw new Error("Invalid quote settings.");
        }

        const changes = body.quoteSettings;

        const previous = isObject(saved.quoteSettings)
          ? saved.quoteSettings
          : {};

        const settings: JsonObject = { ...previous };

        // CURRENCY
        if (changes.currency !== undefined) {
          const currency = text(
            changes.currency,
            "currency",
            3
          ).toUpperCase();

          if (!/^[A-Z]{3}$/.test(currency)) {
            throw new Error("Invalid currency.");
          }

          settings.currency = currency;
        }

        // MULTIPLIERS, DISCOUNTS, AND EXTRAS
        const numericGroups = [
          [
            "serviceMultipliers",
            DEFAULT_SERVICES,
            10,
          ],
          [
            "conditionMultipliers",
            DEFAULT_CONDITIONS,
            10,
          ],
          [
            "frequencyDiscounts",
            DEFAULT_FREQUENCY,
            100,
          ],
          [
            "extraPrices",
            DEFAULT_EXTRAS,
            100_000,
          ],
        ] as const;

        for (const [key, defaults, max] of numericGroups) {
          if (changes[key] !== undefined) {
            settings[key] = mergeNumbers(
              changes[key],
              previous[key],
              defaults,
              max,
              key
            );
          }
        }

        updated.quoteSettings = settings;
      }

      // LEGACY HOUSE TYPES
      if (body.houseTypes !== undefined) {
        updated.houseTypes = mergeNumbers(
          body.houseTypes,
          saved.houseTypes,
          {
            apartment: 1,
            townhouse: 1,
            house: 1,
            commercial: 1,
          },
          10,
          "houseTypes"
        );
      }

      // LEGACY CUSTOM EXTRAS
      if (body.extras !== undefined) {
        if (
          !Array.isArray(body.extras) ||
          body.extras.length > 30
        ) {
          throw new Error("Invalid extras.");
        }

        updated.extras = body.extras.map(
          (entry: unknown) => {
            if (!isObject(entry)) {
              throw new Error("Invalid extra item.");
            }

            return {
              name: text(
                entry.name,
                "extra name",
                100
              ),
              price: amount(
                entry.price,
                0,
                100_000,
                "extra price"
              ),
            };
          }
        );
      }
    } catch (error) {
      return json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid form data.",
        },
        400
      );
    }

    // Never expose or save edit tokens in public JSON.
    delete updated.editToken;
    delete updated.edit_token;

    // SAVE: verify edit token again in update condition.
    const { data: savedRow, error: updateError } =
      await supabase
        .from("cleaning_quote_sites")
        .update({
          data: updated,
        })
        .eq("site_id", siteId)
        .eq("edit_token", editToken)
        .select("site_id")
        .maybeSingle();

    if (updateError) {
      console.error(
        "Cleaning quote UPDATE save error:",
        updateError
      );

      return json(
        {
          error:
            "Could not save changes. Please try again.",
        },
        500
      );
    }

    if (!savedRow) {
      return json(
        {
          error:
            "Quote no longer exists or edit access changed.",
        },
        409
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error(
      "Cleaning quote UPDATE error:",
      error
    );

    return json(
      { error: "Server error." },
      500
    );
  }
}
