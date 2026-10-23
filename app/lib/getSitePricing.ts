import "server-only";

import { getPricingBySubdomain } from "./pricingStore";

const DOMAIN = "simplebookme.com";

export async function getSitePricing(host: string) {
  const hostname = host
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");

  const suffix = `.${DOMAIN}`;

  if (!hostname.endsWith(suffix)) {
    return null;
  }

  const subdomain = hostname.slice(
    0,
    -suffix.length
  );

  if (!subdomain || subdomain.includes(".")) {
    return null;
  }

  return getPricingBySubdomain(subdomain);
}