
import "server-only";

import { getPricingBySubdomain } from "./pricingStore";
import { getProductAccess } from "./billing/getAccess";

const DOMAIN = "simplebookme.com";

export async function getSitePricing(host: string) {
  const hostname = host
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");

  const suffix = `.${DOMAIN}`;

  if (!hostname.endsWith(suffix)) {
    return null;
  }

  const subdomain = hostname.slice(
    0,
    -suffix.length
  );

  if (!subdomain || subdomain.includes(".")) {
    return null;
  }

  // STEP 1: Load the existing Pricing Page.
  // Keep the original lookup unchanged.
  const site = await getPricingBySubdomain(subdomain);

  if (!site) {
    return null;
  }

  // STEP 2: Identify the saved page.
  // Support either naming convention used by the store.
  const identifiers = site as {
    siteId?: string;
    site_id?: string;
  };

  const siteId =
    identifiers.siteId ||
    identifiers.site_id ||
    "";

  if (!siteId) {
    console.error(
      "Pricing Page is missing its site ID."
    );

    return {
      ...site,
      billing: {
        allowed: false,
        status: "unavailable" as const,
        trialEndsAt: null,
        daysRemaining: 0,
      },
    };
  }

  // STEP 3: Check the 14-day trial or payment status.
  try {
    const access = await getProductAccess({
      productKey: "pricing_page",
      resourceId: siteId,
    });

    // Compatibility for Pricing Pages created before
    // the billing system was introduced.
    if (access.status === "unregistered") {
      return {
        ...site,
        billing: {
          ...access,
          allowed: true,
          status: "legacy" as const,
        },
      };
    }

    return {
      ...site,
      billing: access,
    };
  } catch {
    console.error(
      "Unable to check Pricing Page billing status."
    );

    // Do not accidentally expose a page when
    // the billing service cannot verify its status.
    return {
      ...site,
      billing: {
        allowed: false,
        status: "unavailable" as const,
        trialEndsAt: null,
        daysRemaining: 0,
      },
    };
  }
}
