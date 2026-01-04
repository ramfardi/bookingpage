import { defaultLandingConfig } from "./defaultLandingConfig";
import { CUSTOMER_CONFIG } from "./customerConfig";

export function getCustomerConfigFromHost(hostname: string) {
  const cleanHost = hostname
    .replace(/^www\./, "")
    .split(":")[0];

  // Root domain → SALES
  if (cleanHost === "simplebookme.com") {
    return {
      mode: "sales" as const,
      key: null,
      config: defaultLandingConfig,
    };
  }

  const parts = cleanHost.split(".");
  if (parts.length < 3) {
    // localhost, preview URLs, unknown domains
    return {
      mode: "sales" as const,
      key: null,
      config: defaultLandingConfig,
    };
  }

  const subdomain = parts[0];

  // ✅ Client found
  if (CUSTOMER_CONFIG[subdomain]) {
    return {
      mode: "client" as const,
      key: subdomain,
      config: CUSTOMER_CONFIG[subdomain],
    };
  }

  // Fallback → SALES
  return {
    mode: "sales" as const,
    key: null,
    config: defaultLandingConfig,
  };
}
