import "server-only";

import type { Metadata } from "next";
import type { CustomerConfig } from "./customerConfig";
import {
  getHostCustomer,
  getRequestHostname,
  isSubdomainHost,
} from "./getHostCustomer";

/*
 * Metadata (tab title, description, canonical, link previews) for the
 * pages a customer's website shares with simplebookme.com, e.g.
 * {sub}.simplebookme.com/about and /pricing.
 *
 * Without this, those routes reuse the SimpleBookMe marketing metadata
 * from their layout.tsx (wrong tab title, and a canonical pointing at
 * simplebookme.com, which tells Google the customer page is a duplicate).
 */

type CustomerPage = "about" | "pricing" | "gallery" | "schedule" | "booking";

const NOINDEX: Metadata["robots"] = { index: false, follow: false };

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

  const inLocation = location ? ` in ${location}` : "";
  const list = services.slice(0, 4).join(", ");

  let title: string;
  let description: string;

  switch (page) {
    case "about":
      title = location ? `About ${name} | ${location}` : `About ${name}`;
      description = clip(
        customer.about?.description?.trim() ||
          `Learn about ${name}${location ? `, serving ${location}` : ""}. ` +
            `View services, prices and book an appointment online.`
      );
      break;

    case "pricing":
      title = `Services & Pricing | ${name}`;
      description = clip(
        list
          ? `Prices for ${list} at ${name}${inLocation}. Book your appointment online.`
          : `View services and prices for ${name}${inLocation}. Book your appointment online.`
      );
      break;

    case "gallery": {
      title = `Portfolio | ${name}`;
      const hasBeforeAfter = (customer.beforeAfter?.length ?? 0) > 0;
      description = clip(
        `See photos${hasBeforeAfter ? " and before-and-after results" : ""} ` +
          `of work by ${name}${inLocation}. Book your appointment online.`
      );
      break;
    }

    case "schedule":
      title = `Availability & Hours | ${name}`;
      description = clip(
        `Check available appointment times for ${name}${inLocation} and book online.`
      );
      break;

    case "booking":
      title = `Book an Appointment | ${name}`;
      description = clip(
        list
          ? `Book ${list} with ${name}${inLocation}. Choose a service and your preferred time online.`
          : `Book an appointment with ${name}${inLocation}. Choose a service and your preferred time online.`
      );
      break;
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
 *   return customerPageMetadata("about", marketingMetadata);
 *
 * - Customer booking site ({sub}.simplebookme.com with a site):
 *     the customer's own metadata.
 * - Subdomain without a booking site (e.g. an availability, pricing
 *   or quote page subdomain): the fallback, but noindex, since the
 *   page there is SimpleBookMe content duplicated on another host.
 * - simplebookme.com and previews: the fallback unchanged.
 */
export async function customerPageMetadata(
  page: CustomerPage,
  fallback: Metadata
): Promise<Metadata> {
  const customer = await getHostCustomer();

  if (customer) {
    return buildCustomerMetadata(customer, page, await getRequestHostname());
  }

  if (await isSubdomainHost()) {
    return { ...fallback, robots: NOINDEX };
  }

  return fallback;
}

/*
 * For pages that only exist on customer sites (/gallery, /schedule,
 * /booking): blank on simplebookme.com, so never index them there.
 */
export const CUSTOMER_ONLY_FALLBACK: Metadata = { robots: NOINDEX };
