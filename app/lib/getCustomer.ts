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

export async function getCustomerConfigFromHost(
  hostname: string
): Promise<{
  mode: "sales" | "client";
  key: string | null;
  config: LandingConfig | CustomerConfig;
}> {
  // ✅ PATH-BASED (authoritative)
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

  // ✅ SUBDOMAIN (future only — safe fallback)
  const parts = hostname.split(".");
  const subdomain = parts.length > 2 ? parts[0] : null;

  if (subdomain) {
    const res = await fetch(`/api/site/${subdomain}`);
    if (res.ok) {
      const site = (await res.json()) as CustomerConfig;
      return {
        mode: "client",
        key: subdomain,
        config: site,
      };
    }
  }

  // ✅ SALES FALLBACK
  return {
    mode: "sales",
    key: null,
    config: SALES_CONFIG,
  };
}
