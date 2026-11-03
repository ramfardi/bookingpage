
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
      return json({ error: "Missing siteId." }, 400);
    }

    if (siteId.length > 128) {
      return json({ error: "Invalid siteId." }, 400);
    }

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

    // 1. Original lookup by site ID
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

    // 2. Also support business subdomain
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

    // 3. Verify private edit token when supplied
    if (
      token !== null &&
      token !== quote.edit_token
    ) {
      return json(
        { error: "Invalid private edit link." },
        403
      );
    }

    // 4. Retrieve ALL saved configuration fields
    const savedData: SavedQuoteData =
      quote.data &&
      typeof quote.data === "object" &&
      !Array.isArray(quote.data)
        ? { ...quote.data }
        : {};

    // Do not expose edit tokens stored in JSON
    delete savedData.editToken;
    delete savedData.edit_token;

    // 5. Return configuration to the customer page
    // or authenticated editor
    return json({
      ...savedData,

      siteId: quote.site_id,
      subdomain: quote.subdomain,

      // Only return token after validating it
      ...(token !== null
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
