
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Reusable SimpleBookMe billing system
import { getProductAccess } from "@/app/lib/billing/getAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
};

type SavedQuoteData = Record<string, unknown>;

type CleaningQuoteRow = {
  site_id: string;
  subdomain: string | null;
  edit_token: string;
  data: SavedQuoteData | null;
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: noCacheHeaders,
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const siteId = searchParams.get("siteId")?.trim();
    const token = searchParams.get("token");

    if (!siteId) {
      return json(
        { error: "Missing siteId." },
        400
      );
    }

    if (siteId.length > 128) {
      return json(
        { error: "Invalid siteId." },
        400
      );
    }

    /* ===========================================
       1. CONNECT TO SUPABASE
    =========================================== */

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL1;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "Cleaning quote GET: Supabase configuration is missing."
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

    /* ===========================================
       2. ORIGINAL LOOKUP BY SITE ID
    =========================================== */

    const first = await supabase
      .from("cleaning_quote_sites")
      .select("site_id, subdomain, edit_token, data")
      .eq("site_id", siteId)
      .maybeSingle();

    if (first.error) {
      console.error(
        "Cleaning quote GET lookup error:",
        first.error
      );

      return json(
        { error: "Could not load the quote page." },
        500
      );
    }

    let quote = first.data as CleaningQuoteRow | null;

    /* ===========================================
       3. FALLBACK LOOKUP BY SUBDOMAIN
    =========================================== */

    if (!quote) {
      const second = await supabase
        .from("cleaning_quote_sites")
        .select("site_id, subdomain, edit_token, data")
        .eq("subdomain", siteId)
        .maybeSingle();

      if (second.error) {
        console.error(
          "Cleaning quote GET subdomain error:",
          second.error
        );

        return json(
          { error: "Could not load the quote page." },
          500
        );
      }

      quote = second.data as CleaningQuoteRow | null;
    }

    if (!quote) {
      return json(
        { error: "Quote not found." },
        404
      );
    }

    /* ===========================================
       4. VERIFY PRIVATE EDIT TOKEN

       A valid edit token allows the owner
       to retrieve their configuration even
       when the 14-day trial has expired.
    =========================================== */

    const isPrivateRequest = token !== null;

    if (
      isPrivateRequest &&
      token !== quote.edit_token
    ) {
      return json(
        { error: "Invalid private edit link." },
        403
      );
    }

    /* ===========================================
       5. CHECK PUBLIC BILLING ACCESS

       Only public requests need an active
       trial or a completed payment.

       Authorized private editing remains
       available after trial expiration.
    =========================================== */

    if (!isPrivateRequest) {
      try {
        const access = await getProductAccess({
          productKey: "cleaning_quote",
          resourceId: quote.site_id,
        });

        // Existing Cleaning Quote pages may have
        // been created before the billing system.
        // Keep these pages working for now.
        //
        // This is the same legacy policy used
        // by getSiteCleaningQuote.ts.
        if (access.status === "unregistered") {
          console.log(
            "Allowing legacy Cleaning Quote:",
            quote.site_id
          );
        } else if (!access.allowed) {
          // Trial expired and no Stripe payment.
          return json(
            {
              error:
                "This Cleaning Quote Page is inactive because its free trial has ended.",
              status: "expired",
              trialEndsAt: access.trialEndsAt,
            },
            403
          );
        }
      } catch (billingError) {
        console.error(
          "Cleaning quote GET billing error:",
          billingError
        );

        // Do not expose the quote configuration
        // when the payment status cannot be checked.
        return json(
          {
            error:
              "This quote page is temporarily unavailable.",
            status: "unavailable",
          },
          503
        );
      }
    }

    /* ===========================================
       6. PREPARE EXISTING QUOTE DATA
    =========================================== */

    const savedData: SavedQuoteData =
      quote.data &&
      typeof quote.data === "object" &&
      !Array.isArray(quote.data)
        ? { ...quote.data }
        : {};

    // Never expose private tokens stored in JSON.
    delete savedData.editToken;
    delete savedData.edit_token;

    /* ===========================================
       7. RETURN QUOTE CONFIGURATION

       Preserve existing response format.

       Only include editToken for a validated
       private editing request.
    =========================================== */

    return json({
      ...savedData,

      siteId: quote.site_id,
      subdomain: quote.subdomain,

      ...(isPrivateRequest
        ? { editToken: quote.edit_token }
        : {}),
    });

  } catch (error) {
    console.error(
      "GET cleaning quote error:",
      error
    );

    return json(
      { error: "Server error." },
      500
    );
  }
}
