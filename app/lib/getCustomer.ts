import { defaultLandingConfig } from "./defaultLandingConfig";
import { CustomerConfig } from "./customerConfig";

export function getCustomerConfigFromHost(hostname: string): {
  config: CustomerConfig;
  mode: "sales" | "client";
  key: string | null;
} {
  // root domain → SALES LANDING
  if (
    hostname === "simplebookme.com" ||
    hostname === "www.simplebookme.com" ||
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
  //const customerConfig = /* fetched config */;
  const customerConfig: CustomerConfig = defaultLandingConfig;

  return {
    config: customerConfig,
    mode: "client",
    key: subdomain
  };
}


