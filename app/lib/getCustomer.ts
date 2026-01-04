import { defaultLandingConfig } from "./defaultLandingConfig";
import { customerConfig } from "./customerConfig"; // map of clients

export function getCustomerConfigFromHost(hostname: string) {
  // Normalize
  const cleanHost = hostname
    .replace("www.", "")
    .split(":")[0]; // remove port

  // Root domain → SALES
  if (cleanHost === "simplebookme.com") {
    return {
      mode: "sales" as const,
      key: null,
      config: defaultLandingConfig,
    };
  }

  // Subdomain logic
  const parts = cleanHost.split(".");
  if (parts.length < 3) {
    // e.g. localhost, unknown domain
    return {
      mode: "sales" as const,
      key: null,
      config: defaultLandingConfig,
    };
  }

  const subdomain = parts[0];

  // Client found
  if (customerConfig[subdomain]) {
    return {
      mode: "client" as const,
      key: subdomain,
      config: customerConfig[subdomain],
    };
  }

  // Fallback → sales
  return {
    mode: "sales" as const,
    key: null,
    config: defaultLandingConfig,
  };
}
