import "server-only";

import type { CustomerConfig } from "./customerConfig";
import { previewImage } from "./customerMetadata";

/*
 * schema.org LocalBusiness data for a customer's booking website
 * ({sub}.simplebookme.com). Rendered on the homepage by app/page.tsx,
 * so Google can show the business name, contact details, services
 * and booking link in search results and Maps-style panels.
 *
 * Rules followed (Google structured-data guidelines):
 * - Only information that is also shown on the site.
 * - No aggregateRating / review: Google ignores, and can penalise,
 *   reviews a business publishes about itself.
 * - Empty fields are left out instead of sent as "".
 */

// Closest schema.org type per template. Unknown → LocalBusiness.
const TYPE_BY_TEMPLATE: Partial<Record<CustomerConfig["templateId"], string>> = {
  hairsalon: "HairSalon",
  beauty: "BeautySalon",
  fitness: "HealthClub",
  home: "HomeAndConstructionBusiness",
  accounting: "AccountingService",
  auto: "AutoWash",
  photo: "ProfessionalService",
};

const MAX_OFFERS = 50;

function text(value: string | undefined | null): string | undefined {
  const clean = value?.replace(/\s+/g, " ").trim();
  return clean ? clean : undefined;
}

function httpUrl(value: string | undefined): string | undefined {
  const clean = value?.trim();
  return clean && /^https?:\/\//i.test(clean) ? clean : undefined;
}

/* Drops undefined values and empty objects/arrays, recursively. */
function compact<T>(value: T): T | undefined {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => compact(item))
      .filter((item) => item !== undefined);
    return (items.length ? items : undefined) as T | undefined;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compact(item)] as const)
      .filter(([, item]) => item !== undefined);

    // An object holding nothing but its "@type" carries no information.
    const meaningful = entries.filter(([key]) => key !== "@type");
    return (meaningful.length ? Object.fromEntries(entries) : undefined) as
      | T
      | undefined;
  }

  return value === undefined || value === null || value === ""
    ? undefined
    : value;
}

function offers(customer: CustomerConfig) {
  const fromRows =
    customer.pricing?.rows?.map((row) => ({
      name: text(row.name),
      description: text(row.includes),
    })) ?? [];

  const fromItems =
    customer.pricing?.items?.map((item) => ({
      name: text(item.label),
      description: text(item.description),
    })) ?? [];

  const fromServices = (customer.services ?? []).map((name) => ({
    name: text(name),
    description: undefined as string | undefined,
  }));

  const seen = new Set<string>();

  return [...fromRows, ...fromItems, ...fromServices]
    .filter((service): service is { name: string; description: string | undefined } => {
      if (!service.name) return false;
      const key = service.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_OFFERS)
    .map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
      },
    }));
}

export function buildLocalBusinessSchema(
  customer: CustomerConfig,
  hostname: string
) {
  const origin = `https://${hostname}`;
  const name = text(customer.businessName);

  if (!name) return null;

  const contact = customer.contact ?? {};
  const social = customer.socialLinks ?? {};

  const bookingUrl =
    customer.booking?.is_external && httpUrl(customer.booking.bookingLink)
      ? httpUrl(customer.booking.bookingLink)
      : `${origin}/booking`;

  const catalog = offers(customer);

  return compact({
    "@context": "https://schema.org",
    "@type": TYPE_BY_TEMPLATE[customer.templateId] ?? "LocalBusiness",
    "@id": `${origin}/#business`,

    name,
    url: origin,

    description:
      text(customer.about?.description) ||
      text(customer.seo?.description) ||
      text(customer.landing?.subheader1),

    image: previewImage(customer.heroImage, origin),
    logo: previewImage(customer.branding?.logoUrl, origin),

    telephone: text(contact.phone),
    email: text(contact.email),

    address: {
      "@type": "PostalAddress",
      streetAddress: text(contact.address),
      addressLocality: text(contact.city),
      addressRegion: text(contact.province),
      addressCountry: text(contact.country),
    },

    areaServed: text(customer.branding?.servingCity),

    sameAs: [social.instagram, social.tiktok, social.x, social.linkedin]
      .map(httpUrl)
      .filter(Boolean),

    hasOfferCatalog: catalog.length
      ? {
          "@type": "OfferCatalog",
          name: `${name} services`,
          itemListElement: catalog,
        }
      : undefined,

    potentialAction: {
      "@type": "ReserveAction",
      target: bookingUrl,
    },
  });
}
