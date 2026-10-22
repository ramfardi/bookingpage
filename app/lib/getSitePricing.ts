import "server-only";

import { getPricing } from "./pricingStore";

const DOMAIN = "simplebookme.com";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getSitePricing(host: string) {
  const hostname = host
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");

  const suffix = `.${DOMAIN}`;

  if (!hostname.endsWith(suffix)) {
    return null;
  }

  const siteId = hostname.slice(0, -suffix.length);

  // Current pricing records use UUID page IDs.
  if (!UUID_PATTERN.test(siteId)) {
    return null;
  }

  const data = await getPricing(siteId);

  return data ? { siteId, data } : null;
}