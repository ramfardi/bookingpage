import type { LandingConfig } from "./landingConfig";
import type { CustomerConfig } from "./customerConfig";

const SALES_CONFIG: LandingConfig = {
  heroImage: "/images/hero-default.png",
  landing: {
    header1: "Simple",
    header2: "Booking",
    subheader1: "Create a booking website in minutes",
    subheader2: "No setup. No hassle.",
  },
};

const MAIN_DOMAIN = "yourdomain.com";

export async function getCustomerConfigFromHost(
  hostname: string
): Promise<{
  mode: "sales" | "client";
  key: string | null;
  config: LandingConfig | CustomerConfig;
}> {
  /* --------------------------------------------------
   * 1️⃣ PATH-BASED PREVIEW (authoritative)
   * -------------------------------------------------- */
  if (typeof window !== "undefined") {
    const match = window.location.pathname.match(/^\/site\/([^/]+)/);

    if (match) {
      const siteId = match[1];

      const res = await fetch(`/api/site/${siteId}`);
      if (res.ok) {
        const site = (await res.json()) as CustomerConfig;

        return {
          mode: "client",
          key: siteId,
          config: site,
        };
      }
    }
  }

  /* --------------------------------------------------
   * 2️⃣ SUBDOMAIN (robust)
   * -------------------------------------------------- */
  const cleanHost = hostname
    .replace(":3000", "")
    .replace("www.", "");

  let subdomain: string | null = null;

  // localhost: client.localhost
  if (cleanHost.endsWith("localhost")) {
    subdomain = cleanHost.split(".")[0];
  }

  // production: client.yourdomain.com
  if (cleanHost.endsWith(MAIN_DOMAIN)) {
    const parts = cleanHost.split(".");
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  if (subdomain && subdomain !== "localhost") {
    const res = await fetch(`/api/site/${subdomain}`);
    if (res.ok) {
      const site = (await res.json()) as CustomerConfig;

      return {
        mode: "client",
        key: site.siteId ?? subdomain,
        config: site,
      };
    }
  }

  /* --------------------------------------------------
   * 3️⃣ SALES FALLBACK
   * -------------------------------------------------- */
  return {
    mode: "sales",
    key: null,
    config: SALES_CONFIG,
  };
}
