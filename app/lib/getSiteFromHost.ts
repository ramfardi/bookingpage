
import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getProductAccess } from "./billing/getAccess";

export async function getSiteFromHost(host: string) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL1;

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase env vars");
      return null;
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    );

    /* ---------------- SUBDOMAIN ---------------- */

    const cleanHost = host
      .trim()
      .toLowerCase()
      .split(":")[0];

    const parts = cleanHost.split(".");

    // Preserve existing hostname behavior.
    if (parts.length < 3) return null;

    const subdomain = parts[0];

    if (!subdomain || subdomain === "www") {
      return null;
    }

    /* ---------------- LOAD AVAILABILITY PAGE ---------------- */

    const { data, error } = await supabase
      .from("availability_sites")
      .select("*")
      .eq("subdomain", subdomain)
      .maybeSingle();

    if (error) {
      console.error(
        "Supabase availability lookup error:",
        error.code
      );

      return null;
    }

    if (!data) {
      return null;
    }

    /* ---------------- BILLING CHECK ---------------- */

    const siteId = data.site_id;

    if (
      typeof siteId !== "string" ||
      !siteId.trim()
    ) {
      console.error(
        "Availability page is missing its site ID."
      );

      return {
        ...data,
        billing: {
          allowed: false,
          status: "unavailable" as const,
        },
      };
    }

    try {
      const access = await getProductAccess({
        productKey: "availability",
        resourceId: siteId,
      });

      /*
       * Existing pages without billing records need
       * explicit grandfathering.
       *
       * An unregistered page is NOT automatically free.
       * Otherwise a failed billing registration could
       * leave a newly created page active forever.
       */

      if (access.status === "unregistered") {
        const legacySiteIds = new Set(
          (
            process.env.AVAILABILITY_LEGACY_SITE_IDS ||
            ""
          )
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        );

        const isLegacy =
          legacySiteIds.has(siteId);

        return {
          ...data,
          billing: {
            ...access,
            allowed: isLegacy,
            status: isLegacy
              ? ("legacy" as const)
              : ("unregistered" as const),
          },
        };
      }

      return {
        ...data,
        billing: access,
      };
    } catch {
      console.error(
        "Unable to verify availability billing status."
      );

      // Do not expose pages if payment verification
      // fails unexpectedly.
      return {
        ...data,
        billing: {
          allowed: false,
          status: "unavailable" as const,
        },
      };
    }
  } catch {
    console.error(
      "getSiteFromHost error"
    );

    return null;
  }
}
