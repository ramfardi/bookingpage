import type { MetadataRoute } from "next";
import type { CustomerConfig } from "./lib/customerConfig";
import { getHostCustomer, getRequestHostname } from "./lib/getHostCustomer";
import { getSiteFromHost } from "./lib/getSiteFromHost";
import { getSiteCleaningQuote } from "./lib/getSiteCleaningQuote";
import { getSitePricing } from "./lib/getSitePricing";

const MAIN_DOMAIN = "simplebookme.com";

/*
 * /sitemap.xml, host-aware (M3).
 *
 * - simplebookme.com: the public marketing pages.
 * - {sub}.simplebookme.com: that business's own pages, so each
 *   customer site can be crawled on its own. app/robots.ts points each
 *   subdomain's robots.txt at its own sitemap.
 *
 * Only list pages that are indexable: the subdomain noindex rule in
 * next.config.mjs allows exactly /, /about, /pricing, /gallery,
 * /schedule and /booking on customer subdomains.
 */

/* ---------------- simplebookme.com ---------------- */

const MAIN_PAGES = [
  "/",
  "/about",
  "/pricing",
  "/support",

  "/cleaning",
  "/beauty",
  "/home_services",
  "/cleaning/quote-gen",

  "/tools",
  "/qr-code-generator",
  "/google_review_qr",
  "/instagram_setup",
  "/flyer",
  "/calendar",
  "/availability",
  "/cleaning-pricing-calculator",
  "/advertising-budget-calculator",
  "/service-price-calculator",
  "/tools/business-card",

  "/guide",
  "/guide/google-business",
  "/guide/business-email",
  "/guide/pricing-guide",
  "/guide/payment-methods",
  "/guide/getting-first-clients",
  "/guide/advertising-small-business",

  "/fr/calculateur-budget-publicitaire",
  "/fr/generateur-code-qr",
  "/es/calculadora-presupuesto-publicidad",
  "/es/generador-codigo-qr",
  "/fa/generator-qr-code",
  "/ar/generator-qr-code",
];

function mainSitemap(): MetadataRoute.Sitemap {
  const baseUrl = `https://${MAIN_DOMAIN}`;

  return MAIN_PAGES.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/pricing" ||
            path === "/tools" ||
            path === "/cleaning" ||
            path === "/beauty" ||
            path === "/home_services"
          ? 0.9
          : 0.7,
  }));
}

/* ---------------- {sub}.simplebookme.com ---------------- */

function hasPricing(customer: CustomerConfig): boolean {
  return Boolean(
    customer.pricing?.rows?.length || customer.pricing?.items?.length
  );
}

function hasGallery(customer: CustomerConfig): boolean {
  return Boolean(
    customer.about?.gallery?.length || customer.beforeAfter?.length
  );
}

/* Pages of a booking website, skipping ones that would only show an
 * empty state ("Schedule is not available yet", empty portfolio). */
function bookingSitePages(customer: CustomerConfig): string[] {
  return [
    "/",
    "/about",
    hasPricing(customer) ? "/pricing" : null,
    hasGallery(customer) ? "/gallery" : null,
    customer.schedule?.enabled ? "/schedule" : null,
    // External booking: the button links off-site, /booking is unused.
    customer.booking?.is_external ? null : "/booking",
  ].filter((path): path is string => path !== null);
}

/* Same lookup order as app/page.tsx: cleaning quote, availability,
 * pricing page, then booking website. The first three are one-page
 * sites served at "/". */
async function subdomainPages(host: string): Promise<string[]> {
  try {
    if (await getSiteCleaningQuote(host)) return ["/"];
    if (await getSiteFromHost(host)) return ["/"];
    if (await getSitePricing(host)) return ["/"];

    const customer = await getHostCustomer();
    return customer ? bookingSitePages(customer) : [];
  } catch {
    console.error("sitemap: site lookup failed");
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = await getRequestHostname();

  if (!host.endsWith(`.${MAIN_DOMAIN}`)) {
    return mainSitemap();
  }

  const pages = await subdomainPages(host);

  return pages.map((path) => ({
    url: path === "/" ? `https://${host}` : `https://${host}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
