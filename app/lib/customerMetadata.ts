import "server-only";

import type { Metadata } from "next";
import type { CustomerConfig } from "./customerConfig";
import { getHostCustomer, getRequestHostname } from "./getHostCustomer";

/*
 * Metadata (tab title, description, canonical, link previews) for the
 * pages a customer's website shares with simplebookme.com, e.g.
 * {sub}.simplebookme.com/about and /pricing.
 *
 * Without this, those routes reuse the SimpleBookMe marketing metadata
 * from their layout.tsx (wrong tab title, and a canonical pointing at
 * simplebookme.com, which tells Google the customer page is a duplicate).
 */

type CustomerPage = "about" | "pricing";

const MAX_DESCRIPTION = 160;

function clip(text: string, max = MAX_DESCRIPTION): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

function locationOf(customer: CustomerConfig): string {
  return [customer.contact?.city, customer.contact?.province]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

/* Only absolute http(s) or site-relative images work as link previews. */
function previewImage(
  url: string | undefined,
  origin: string
): string | undefined {
  const value = url?.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/") && !value.startsWith("//")) {
    return `${origin}${value}`;
  }
  return undefined; // e.g. data: URLs
}

function serviceNames(customer: CustomerConfig): string[] {
  const fromRows = customer.pricing?.rows?.map((row) => row.name) ?? [];
  const fromItems = customer.pricing?.items?.map((item) => item.label) ?? [];
  const fromServices = customer.services ?? [];

  return [...fromRows, ...fromItems, ...fromServices]
    .map((name) => name?.trim())
    .filter((name): name is string => Boolean(name))
    .filter((name, i, all) => all.indexOf(name) === i);
}

function buildCustomerMetadata(
  customer: CustomerConfig,
  page: CustomerPage,
  hostname: string
): Metadata {
  const origin = `https://${hostname}`;
  const url = `${origin}/${page}`;

  const name = customer.businessName?.trim() || "Our business";
  const location = locationOf(customer);
  const services = serviceNames(customer);

  let title: string;
  let description: string;

  if (page === "about") {
    title = location ? `About ${name} | ${location}` : `About ${name}`;

    description = clip(
      customer.about?.description?.trim() ||
        `Learn about ${name}${location ? `, serving ${location}` : ""}. ` +
          `View services, prices and book an appointment online.`
    );
  } else {
    title = `Services & Pricing | ${name}`;

    const list = services.slice(0, 4).join(", ");

    description = clip(
      list
        ? `Prices for ${list} at ${name}${location ? ` in ${location}` : ""}. ` +
            `Book your appointment online.`
        : `View services and prices for ${name}${location ? ` in ${location}` : ""}. ` +
            `Book your appointment online.`
    );
  }

  const image =
    previewImage(customer.heroImage, origin) ??
    previewImage(customer.branding?.logoUrl, origin);

  const keywords =
    customer.seo?.keywords?.length
      ? customer.seo.keywords
      : [name, location, ...services.slice(0, 8)].filter(Boolean);

  return {
    title,
    description,
    keywords,

    alternates: {
      canonical: url,
    },

    robots: {
      index: true,
      follow: true,
    },

    // Set openGraph and twitter in full: a partial object would keep
    // nothing from the parent, and leaving one out would inherit the
    // SimpleBookMe card from the root layout.
    openGraph: {
      title,
      description,
      url,
      siteName: name,
      type: "website",
      ...(image ? { images: [{ url: image, alt: name }] } : {}),
    },

    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/*
 * Use from a layout/page generateMetadata:
 *   return (await customerPageMetadata("about")) ?? marketingMetadata;
 * Returns null on simplebookme.com (and previews), so the marketing
 * metadata is used there unchanged.
 */
export async function customerPageMetadata(
  page: CustomerPage
): Promise<Metadata | null> {
  const customer = await getHostCustomer();
  if (!customer) return null;

  return buildCustomerMetadata(customer, page, await getRequestHostname());
}
