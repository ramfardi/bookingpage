import type { LandingConfig } from "./landingConfig";
import type { CustomerConfig } from "./customerConfig";

const SALES_CONFIG: LandingConfig = {
  heroImage: "/images/cleaning.jpg",
  landing: {
    header1: "Create a Cleaning Service",
    header2: "Booking Website",
    subheader1: "Everything you need to create a cleaning website with online booking",
    subheader2: "No monthly fee | Easy to use | Customizable",
  },
};


const MAIN_DOMAIN = "simplebookme.com";

export async function getCustomerConfigFromHost(
  hostname: string
): Promise<{
  mode: "sales" | "client";
  key: string | null;
  config: LandingConfig | CustomerConfig;
}> {
  /* --------------------------------------------------
   * 1️⃣ PREVIEW / EDITOR MODE (PATH-BASED)
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
   * 2️⃣ CLIENT MODE (SUBDOMAIN)
   * -------------------------------------------------- */
  const cleanHost = hostname
    .replace(":3000", "")
    .replace("www.", "");

  let subdomain: string | null = null;

  // localhost: qq.localhost
  if (cleanHost.endsWith("localhost")) {
    subdomain = cleanHost.split(".")[0];
  }

  // production: qq.simplebookme.com
  if (cleanHost.endsWith(MAIN_DOMAIN)) {
    const parts = cleanHost.split(".");
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  if (subdomain && subdomain !== "localhost") {
    const res = await fetch(`/api/site/${subdomain}`);

    if (res.ok) {
      const site = (await res.json()) as CustomerConfig & {
        siteId?: string;
      };

      return {
        mode: "client",
        key: site.siteId ?? subdomain,
        config: site,
      };
    }
  }

  /* --------------------------------------------------
   * 3️⃣ SALES MODE (FALLBACK)
   * -------------------------------------------------- */
  return {
    mode: "sales",
    key: null,
    config: SALES_CONFIG,
  };
}
