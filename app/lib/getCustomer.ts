import { defaultLandingConfig } from "./defaultLandingConfig";
import { CustomerConfig } from "./customerConfig";

export function getCustomerConfigFromHost(hostname: string) {
  const cleanHost = hostname
    .replace(/^www\./, "")
    .split(":")[0];

  // Root domain → sales
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

  // Client found
  if (CustomerConfig[subdomain]) {
    return {
      mode: "client" as const,
      key: subdomain,
      config: CustomerConfig[subdomain],
    };
  }

  // Fallback → sales
  return {
    mode: "sales" as const,
    key: null,
    config: defaultLandingConfig,
  };
}
