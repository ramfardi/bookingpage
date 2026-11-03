
import { createClient } from "@supabase/supabase-js";

type CleaningQuoteData = Record<string, unknown>;

type CleaningQuoteSite = {
  siteId: string;
  site_id: string;
  subdomain: string;
  data: CleaningQuoteData;
};

function extractSubdomain(host: string): string | null {
  const cleanHost = host
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");

  if (!cleanHost) return null;

  const parts = cleanHost.split(".");

  // Support normal subdomains and local development.
  const isLocalSubdomain =
    parts.length === 2 && parts[1] === "localhost";

  if (parts.length < 3 && !isLocalSubdomain) {
    return null;
  }

  const subdomain = parts[0];

  // Ignore root and www hosts.
  if (!subdomain || subdomain === "www") {
    return null;
  }

  // Validate subdomain format.
  if (!/^[a-z0-9-]{1,63}$/.test(subdomain)) {
    return null;
  }

  return subdomain;
}

export async function getSiteCleaningQuote(
  host: string
): Promise<CleaningQuoteSite | null> {
  try {
    const subdomain = extractSubdomain(host);

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

    // Server-side Supabase client.
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

    // Fetch public quote configuration only.
    // Never retrieve the private edit_token column.
    const { data: site, error } = await supabase
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

    // Validate saved JSON configuration.
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

    // Preserve every saved quote setting while removing
    // any legacy private tokens stored in JSON.
    const quoteData: CleaningQuoteData = {
      ...(site.data as CleaningQuoteData),
    };

    delete quoteData.editToken;
    delete quoteData.edit_token;

    return {
      siteId: site.site_id,

      // Keep original naming for compatibility.
      site_id: site.site_id,

      subdomain: site.subdomain,

      // All new and existing customer-facing settings.
      data: quoteData,
    };
  } catch (error) {
    console.error(
      "getSiteCleaningQuote error:",
      error
    );

    return null;
  }
}
