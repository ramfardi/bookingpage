"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost, SALES_CONFIG } from "./getCustomer";
import type { CustomerConfig } from "./customerConfig";
import type { LandingConfig } from "./landingConfig";

export type HostMode = "sales" | "client";

/*
 * Props a server page.tsx passes to its client component.
 * initialCustomer comes from getHostCustomer() on the server:
 * - a CustomerConfig on a customer subdomain  -> "client" mode
 * - null on simplebookme.com                  -> "sales" mode
 */
export type HostConfigProps = {
  initialCustomer?: CustomerConfig | null;
};

/*
 * SEO: replaces the old pattern of
 *   useState(null) + useEffect(fetch) + `if (!customer) return null`
 * which made the server send an empty page.
 *
 * The page now renders with real content on the server. The
 * browser lookup still runs as a fallback (e.g. qq.localhost in
 * dev, or if the server lookup failed). It only switches the page
 * to client mode and never back, so the main site doesn't flicker.
 */
export function useHostConfig(
  { initialCustomer = null }: HostConfigProps = {},
  salesConfig: LandingConfig = SALES_CONFIG
) {
  const [customer, setCustomer] = useState<
    CustomerConfig | LandingConfig
  >(initialCustomer ?? salesConfig);

  const [mode, setMode] = useState<HostMode>(
    initialCustomer ? "client" : "sales"
  );

  const [customerKey, setCustomerKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCustomerConfigFromHost(window.location.hostname)
      .then((result) => {
        if (cancelled) return;

        setCustomerKey(result.key);

        if (result.mode === "client") {
          setCustomer(result.config);
          setMode("client");
        }
      })
      .catch((error) => {
        console.error("Unable to load site configuration:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { customer, mode, customerKey };
}
