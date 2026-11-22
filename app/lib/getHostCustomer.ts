import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import type { CustomerConfig } from "./customerConfig";
import { getCustomerServer } from "./getCustomerServer";

const MAIN_DOMAIN = "simplebookme.com";

/*
 * The request's hostname, normalised: lowercase, no port, no "www.".
 */
export async function getRequestHostname(): Promise<string> {
  return ((await headers()).get("host") || "")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/^www\./, "");
}

/*
 * Server-side twin of getCustomerConfigFromHost (getCustomer.ts),
 * so pages that serve both simplebookme.com ("sales") and customer
 * subdomains ("client") can pick the right mode before rendering.
 *
 * Returns the customer's config on {sub}.simplebookme.com, otherwise null.
 * Mirrors the browser logic: only *.simplebookme.com hosts are treated
 * as customer sites (so *.vercel.app previews stay in sales mode).
 *
 * Wrapped in React cache() so generateMetadata (layout) and the page
 * share one database lookup per request.
 */
export const getHostCustomer = cache(
  async (): Promise<CustomerConfig | null> => {
    const host = await getRequestHostname();

    if (!host.endsWith(`.${MAIN_DOMAIN}`)) {
      return null;
    }

    try {
      return await getCustomerServer(host);
    } catch {
      // Fall back to sales mode; the browser lookup in
      // useHostConfig will still switch to client mode if needed.
      console.error("getHostCustomer: customer lookup failed");
      return null;
    }
  }
);
