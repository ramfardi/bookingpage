import { CUSTOMER_CONFIG } from "./customerConfig";

export function getCustomerConfigFromHost(hostname: string) {
  // localhost or root domain → default
  if (
    hostname === "localhost" ||
    hostname.split(".").length < 3
  ) {
    return CUSTOMER_CONFIG["vida"];
  }

  const subdomain = hostname.split(".")[0];

  return CUSTOMER_CONFIG[subdomain] || CUSTOMER_CONFIG["vida"];
}

