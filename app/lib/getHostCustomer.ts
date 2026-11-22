import "server-only";

import { headers } from "next/headers";
import type { CustomerConfig } from "./customerConfig";
import { getCustomerServer } from "./getCustomerServer";

const MAIN_DOMAIN = "simplebookme.com";

/*
 * Server-side twin of getCustomerConfigFromHost (getCustomer.ts),
 * so pages that serve both simplebookme.com ("sales") and customer
 * subdomains ("client") can pick the right mode before rendering.
 *
 * Returns the customer's config on {sub}.simplebookme.com, otherwise null.
 * Mirrors the browser logic: only *.simplebookme.com hosts are treated
 * as customer sites (so *.vercel.app previews stay in sales mode).
 */
export async function getHostCustomer(): Promise<CustomerConfig | null> {
  const host = ((await headers()).get("host") || "")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/^www\./, "");

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
