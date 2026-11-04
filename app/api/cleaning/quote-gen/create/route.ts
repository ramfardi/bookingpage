
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Reusable SimpleBookMe billing module
import { registerProduct } from "@/app/lib/billing/registerProduct";
import { sendProductLinks } from "@/app/lib/billing/sendLinks";

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

function isObject(
  value: unknown
): value is JsonObject {
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
  if (
    value === undefined ||
    value === null
  ) {
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

function numberFields<
  T extends Record<string, number>
>(
  value: unknown,
  defaults: T,
  max: number,
  field: string
): T {
  const incoming = isObject(value)
    ? value
    : {};

  const result = { ...defaults };

  for (
    const key of Object.keys(defaults) as
    Array<keyof T>
  ) {
    result[key] = amount(
      incoming[String(key)],
      defaults[key],
      max,
      `${field}.${String(key)}`
    ) as T[typeof key];
  }

  return result;
}

function webUrl(
  value: unknown,
  field: string
): string {
  const raw = text(
    value,
    field,
    2048
  );

  if (!raw) return "";

  try {
    const parsed = new URL(
      /^https?:\/\//i.test(raw)
        ? raw
        : `https://${raw}`
    );

    if (
      !["http:", "https:"].includes(
        parsed.protocol
      ) ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password
    ) {
      throw new Error("Invalid URL");
    }

    return parsed.toString();
  } catch {
    throw new Error(
      `Please provide a valid ${field}.`
    );
  }
}

function makeSubdomain(
  businessName: string
): string {
  return (
    businessName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20) || "site"
  );
}

export async function POST(req: Request) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    if (!isObject(body)) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    let siteId: string;
    let editToken: string;
    let businessName: string;
    let businessEmail: string;
    let savedData: JsonObject;

    /* ===========================================
       1. VALIDATE EXISTING FORM DATA
    =========================================== */

    try {
      siteId = text(
        body.siteId,
        "site ID",
        64
      );

      editToken = text(
        body.editToken,
        "edit token",
        128
      );

      businessName = text(
        body.businessName,
        "business name",
        100
      );

      if (
        !/^[a-zA-Z0-9_-]{4,64}$/.test(
          siteId
        ) ||
        !/^[a-zA-Z0-9_-]{8,128}$/.test(
          editToken
        )
      ) {
        throw new Error(
          "Missing or invalid site ID or edit token."
        );
      }

      if (!businessName) {
        throw new Error(
          "Business name is required."
        );
      }

      businessEmail = text(
        body.businessEmail,
        "business email",
        160
      ).toLowerCase();

      // NEW: Email is mandatory because activation
      // and editing links will be sent to the owner.
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          businessEmail
        )
      ) {
        throw new Error(
          "A valid business email is required."
        );
      }

      const rawSettings =
        isObject(body.quoteSettings)
          ? body.quoteSettings
          : {};

      const currencyInput = text(
        rawSettings.currency ?? "USD",
        "currency",
        3
      ).toUpperCase();

      if (
        !/^[A-Z]{3}$/.test(
          currencyInput
        )
      ) {
        throw new Error(
          "Invalid currency."
        );
      }

      savedData = {
        // Original fields
        businessName,

        pricePerSqft: numberFields(
          body.pricePerSqft,
          DEFAULT_RATES,
          1000,
          "pricePerSqft"
        ),

        minimumPrice: amount(
          body.minimumPrice,
          80,
          1_000_000,
          "minimumPrice"
        ),

        // Business information
        businessEmail,

        businessPhone: text(
          body.businessPhone,
          "business phone",
          40
        ),

        serviceArea: text(
          body.serviceArea,
          "service area",
          140
        ),

        // Booking integrations
        availabilityUrl: webUrl(
          body.availabilityUrl,
          "availability link"
        ),

        bookingUrl: webUrl(
          body.bookingUrl,
          "booking link"
        ),

        // Quote configuration
        quoteSettings: {
          currency: currencyInput,

          serviceMultipliers: numberFields(
            rawSettings.serviceMultipliers,
            DEFAULT_SERVICES,
            10,
            "serviceMultipliers"
          ),

          conditionMultipliers: numberFields(
            rawSettings.conditionMultipliers,
            DEFAULT_CONDITIONS,
            10,
            "conditionMultipliers"
          ),

          frequencyDiscounts: numberFields(
            rawSettings.frequencyDiscounts,
            DEFAULT_FREQUENCY,
            100,
            "frequencyDiscounts"
          ),

          extraPrices: numberFields(
            rawSettings.extraPrices,
            DEFAULT_EXTRAS,
            100_000,
            "extraPrices"
          ),
        },
      };

      // Support original optional fields.
      if (isObject(body.houseTypes)) {
        savedData.houseTypes = numberFields(
          body.houseTypes,
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

      if (Array.isArray(body.extras)) {
        savedData.extras = body.extras
          .slice(0, 30)
          .filter(isObject)
          .map((item) => ({
            name: text(
              item.name,
              "extra name",
              100
            ),
            price: amount(
              item.price,
              0,
              100_000,
              "extra price"
            ),
          }));
      }
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid form data.",
        },
        { status: 400 }
      );
    }

    /* ===========================================
       2. VERIFY SERVER CONFIGURATION
    =========================================== */

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL1;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      console.error(
        "Cleaning quote create: missing Supabase environment variables."
      );

      return NextResponse.json(
        {
          error:
            "Server configuration error.",
        },
        { status: 500 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      console.error(
        "NEXT_PUBLIC_APP_URL is missing."
      );

      return NextResponse.json(
        {
          error:
            "Application URL is not configured.",
        },
        { status: 500 }
      );
    }

    let appOrigin: string;

    try {
      const parsed = new URL(appUrl);

      if (
        !["https:", "http:"].includes(
          parsed.protocol
        ) ||
        !parsed.hostname
      ) {
        throw new Error("Invalid app URL");
      }

      appOrigin = parsed.origin;
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid application URL configuration.",
        },
        { status: 500 }
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

    const base = makeSubdomain(
      businessName
    );

    /* ===========================================
       3. CREATE THE CLEANING QUOTE PAGE
    =========================================== */

    // Preserve the existing collision handling.
    for (
      let attempt = 0;
      attempt < 3;
      attempt++
    ) {
      const suffix =
        attempt === 0
          ? ""
          : `${siteId.slice(0, 6)}${
              attempt === 2 ? "2" : ""
            }`;

      const subdomain =
        `${base.slice(
          0,
          20 - suffix.length
        )}${suffix}`;

      const { error } = await supabase
        .from("cleaning_quote_sites")
        .insert({
          site_id: siteId,
          subdomain,
          edit_token: editToken,
          data: savedData,
        });

      if (!error) {
        /* ====================================
           4. REGISTER THE 14-DAY TRIAL
        ==================================== */

        let billing;

        try {
          billing = await registerProduct({
            productKey: "cleaning_quote",
            resourceId: siteId,
            email: businessEmail,
          });
        } catch (billingError) {
          console.error(
            "Cleaning quote billing registration failed:",
            billingError
          );

          // The quote page was just inserted.
          // Roll it back if trial registration fails.
          // This is a best-effort cleanup.
          const { error: rollbackError } =
            await supabase
              .from("cleaning_quote_sites")
              .delete()
              .eq("site_id", siteId)
              .eq("subdomain", subdomain)
              .eq("edit_token", editToken);

          if (rollbackError) {
            console.error(
              "Cleaning quote rollback failed:",
              rollbackError
            );
          }

          return NextResponse.json(
            {
              error:
                "Could not initialize the free trial. Please try again.",
            },
            { status: 500 }
          );
        }

        /* ====================================
           5. GENERATE PUBLIC AND PRIVATE URLS
        ==================================== */

        const publicUrl =
          `https://${subdomain}.simplebookme.com`;

        const editUrl = new URL(
          `/cleaning/quote-gen/${encodeURIComponent(
            siteId
          )}/edit`,
          appOrigin
        );

        editUrl.searchParams.set(
          "token",
          editToken
        );

        const privateUrl =
          editUrl.toString();

        /* ====================================
           6. SEND WELCOME EMAIL VIA RESEND
        ==================================== */

        let emailSent = false;

        try {
          await sendProductLinks({
            productKey: "cleaning_quote",
            email: businessEmail,
            businessName,
            publicUrl,
            privateUrl,
            activationUrl:
              billing.activationUrl,
            trialEndsAt:
              billing.trialEndsAt,
          });

          emailSent = true;

          // Record that the welcome email was sent.
          const now =
            new Date().toISOString();

          const { error: emailUpdateError } =
            await supabase
              .from("product_activations")
              .update({
                welcome_email_sent_at: now,
                updated_at: now,
              })
              .eq(
                "product_key",
                "cleaning_quote"
              )
              .eq(
                "resource_id",
                siteId
              )
              .is(
                "welcome_email_sent_at",
                null
              );

          if (emailUpdateError) {
            console.error(
              "Unable to record welcome email status:",
              emailUpdateError
            );
          }
        } catch (emailError) {
          // Do not lose a successfully created page
          // simply because email delivery failed.
          console.error(
            "Cleaning quote welcome email failed:",
            emailError
          );
        }

        /* ====================================
           7. RETURN CREATION RESULT
        ==================================== */

        return NextResponse.json(
          {
            success: true,

            // Original response field
            subdomain,

            // Additional fields
            siteId,
            publicUrl,
            editUrl: privateUrl,
            activationUrl:
              billing.activationUrl,

            trialStartedAt:
              billing.trialStartedAt,

            trialEndsAt:
              billing.trialEndsAt,

            emailSent,

            ...(!emailSent
              ? {
                  emailWarning:
                    "Your page was created, but the email could not be sent. Please save your links.",
                }
              : {}),
          },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );
      }

      // Retry if a unique constraint is hit.
      if (error.code !== "23505") {
        console.error(
          "Cleaning quote Supabase insert error:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Could not save the quote page. Please try again.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "That business link is already in use. Please try generating again.",
      },
      { status: 409 }
    );
  } catch (error) {
    console.error(
      "Cleaning quote create error:",
      error
    );

    return NextResponse.json(
      {
        error: "Server error.",
      },
      { status: 500 }
    );
  }
}
