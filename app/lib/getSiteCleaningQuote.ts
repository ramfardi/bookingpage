
import { createClient } from "@supabase/supabase-js";

// Reusable billing module
import { getProductAccess } from "@/app/lib/billing/getAccess";
import type { ProductAccessResult } from "@/app/lib/billing/getAccess";

type CleaningQuoteData = Record<string, unknown>;

// Additional statuses for existing pages and
// temporary billing service errors.
type CleaningQuoteBilling =
  | ProductAccessResult
  | {
      allowed: true;
      status: "legacy";
      trialEndsAt: null;
      daysRemaining: 0;
    }
  | {
      allowed: false;
      status: "unavailable";
      trialEndsAt: null;
      daysRemaining: 0;
    };

type CleaningQuoteSite = {
  siteId: string;
  site_id: string;
  subdomain: string;
  data: CleaningQuoteData;

  // NEW: Payment and trial information
  billing: CleaningQuoteBilling;
};

/* ============================================
   EXISTING: EXTRACT SUBDOMAIN
============================================ */

function extractSubdomain(
  host: string
): string | null {
  const cleanHost = host
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");

  if (!cleanHost) return null;

  const parts = cleanHost.split(".");

  const isLocalSubdomain =
    parts.length === 2 &&
    parts[1] === "localhost";

  if (
    parts.length < 3 &&
    !isLocalSubdomain
  ) {
    return null;
  }

  const subdomain = parts[0];

  if (
    !subdomain ||
    subdomain === "www"
  ) {
    return null;
  }

  if (
    !/^[a-z0-9-]{1,63}$/.test(
      subdomain
    )
  ) {
    return null;
  }

  return subdomain;
}

/* ============================================
   EXISTING: GET CLEANING QUOTE WEBSITE

   NEW:
   - Checks product payment status
   - Checks 14-day trial
   - Preserves legacy websites
============================================ */

export async function getSiteCleaningQuote(
  host: string
): Promise<CleaningQuoteSite | null> {
  try {
    const subdomain =
      extractSubdomain(host);

    if (!subdomain) {
      return null;
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL1;

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "getSiteCleaningQuote: Missing Supabase environment variables."
      );

      return null;
    }

    /* ========================================
       1. LOAD EXISTING QUOTE CONFIGURATION
    ======================================== */

    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: site,
      error,
    } = await supabase
      .from("cleaning_quote_sites")
      .select("site_id, subdomain, data")
      .eq("subdomain", subdomain)
      .maybeSingle();

    if (error) {
      console.error(
        "getSiteCleaningQuote: Supabase lookup error:",
        error
      );

      return null;
    }

    if (!site) {
      return null;
    }

    // Preserve existing validation.
    if (
      !site.data ||
      typeof site.data !== "object" ||
      Array.isArray(site.data)
    ) {
      console.error(
        "getSiteCleaningQuote: Invalid site configuration.",
        site.site_id
      );

      return null;
    }

    /* ========================================
       2. SANITIZE PUBLIC QUOTE DATA
    ======================================== */

    const quoteData: CleaningQuoteData = {
      ...(site.data as CleaningQuoteData),
    };

    // Keep private editing tokens out
    // of customer-facing data.
    delete quoteData.editToken;
    delete quoteData.edit_token;

    /* ========================================
       3. CHECK TRIAL / PAYMENT STATUS
    ======================================== */

    let billing: CleaningQuoteBilling;

    try {
      const access =
        await getProductAccess({
          productKey: "cleaning_quote",
          resourceId: site.site_id,
        });

      // Pages created before billing was
      // introduced may not have an activation
      // record yet.
      //
      // Keep them accessible for compatibility.
      if (access.status === "unregistered") {
        billing = {
          allowed: true,
          status: "legacy",
          trialEndsAt: null,
          daysRemaining: 0,
        };
      } else {
        billing = access;
      }

    } catch (billingError) {
      console.error(
        "Cleaning Quote billing lookup failed:",
        billingError
      );

      // Do not accidentally allow an expired
      // product if the billing database fails.
      billing = {
        allowed: false,
        status: "unavailable",
        trialEndsAt: null,
        daysRemaining: 0,
      };
    }

    /* ========================================
       4. RETURN WEBSITE + BILLING STATUS
    ======================================== */

    return {
      siteId: site.site_id,

      // Preserve original naming.
      site_id: site.site_id,

      subdomain: site.subdomain,

      // Original customer-facing settings.
      data: quoteData,

      // NEW: Trial and payment information.
      billing,
    };

  } catch (error) {
    console.error(
      "getSiteCleaningQuote error:",
      error
    );

    return null;
  }
}
