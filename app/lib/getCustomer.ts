import { CustomerConfig, LandingConfig } from "./customerConfig";
import { defaultLandingConfig } from "./defaultLandingConfig";

export function getCustomerConfigFromHost(hostname: string): {
  config: CustomerConfig | LandingConfig;
  mode: "sales" | "client";
  key: string | null;
} {
  if (
    hostname === "simplebookme.com" ||
    hostname === "www.simplebookme.com" ||
    hostname.includes("localhost")
  ) {
    return {
      config: defaultLandingConfig,
      mode: "sales",
      key: null,
    };
  }

  // TEMP fallback
  return {
    config: defaultLandingConfig as CustomerConfig,
    mode: "client",
    key: hostname.split(".")[0],
  };
}



