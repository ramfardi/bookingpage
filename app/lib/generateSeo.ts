import type { CustomerConfig } from "./customerConfig";

export function generateSeo(
  config: CustomerConfig
) {
  const businessName =
    config.businessName || "Business";

  const categoryMap: Record<string, string> = {
    hairsalon: "Hair Salon",
    cleaning: "Cleaning Service",
    beauty: "Beauty Salon",
    fitness: "Personal Trainer",
    home: "Home Services",
    accounting: "Accounting Services",
    pet: "Pet Services",
    auto: "Automotive Services",
    photo: "Photography Services",
  };

  const category =
    categoryMap[config.templateId] ||
    "Professional Services";

  const city =
    config.contact?.city || "";

  const province =
    config.contact?.province || "";

  const location =
    [city, province]
      .filter(Boolean)
      .join(", ");

  const services =
    config.services
      ?.slice(0, 5)
      .join(", ") || "";

  const title = location
    ? `${category} in ${location} | ${businessName}`
    : `${category} | ${businessName}`;

  const description =
    config.about?.description?.trim()
      ? config.about.description
      : `${businessName} provides ${services} services ${
          location
            ? `in ${location}`
            : ""
        }. Book online today.`;

  const keywords = [
    businessName,
    category,
    city,
    province,

    ...config.services,

    ...config.services.map(
      (s) => `${s} ${city}`
    ),

    `${category} ${city}`,
    `${category} ${province}`,
  ].filter(Boolean);

  return {
    title: title.substring(0, 60),
    description:
      description.substring(0, 160),
    keywords,
  };
}