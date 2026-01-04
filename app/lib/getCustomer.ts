import { defaultLandingConfig } from "./defaultLandingConfig";
import { CustomerConfig } from "./customerConfig";

export function getCustomerConfigFromHost(hostname: string): {
  config: CustomerConfig;
  mode: "sales" | "client";
  key: string | null;
} {
  // root domain → SALES LANDING
  if (
    hostname === "yourapp.com" ||
    hostname === "www.yourapp.com" ||
    hostname.includes("localhost")
  ) {
    return {
      config: defaultLandingConfig,
      mode: "sales",
      key: null
    };
  }

  // subdomain → CLIENT SITE
  const subdomain = hostname.split(".")[0];

  // ⚠️ in prod this comes from Supabase / middleware
  const customerConfig = /* fetched config */;

  return {
    config: customerConfig,
    mode: "client",
    key: subdomain
  };
}


