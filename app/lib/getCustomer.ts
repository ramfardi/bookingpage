import { CUSTOMER_CONFIG } from "./customerConfig";

export function getCustomerConfigFromHost(host: string) {
  const parts = host.split(".");
  const subdomain = parts.length > 2 ? parts[0] : null;

  if (subdomain && CUSTOMER_CONFIG[subdomain]) {
    return {
      key: subdomain,
      config: CUSTOMER_CONFIG[subdomain],
    };
  }

  // Fallback for root domain (default customer)
  return {
    key: "vida", // ← choose your default
    config: CUSTOMER_CONFIG["vida"],
  };
}


