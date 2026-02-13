import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://simplebookme.com";
  const now = new Date();

  const staticPages = [
    "/",
    "/about",
    "/pricing",

    // Category landing pages
    "/cleaning",
    "/beauty",
    "/home_services",

    // Guide hub
    "/guide",
    "/guide/google-business",
    "/guide/business-email",
    "/guide/pricing-guide",
    "/guide/payment-methods",
    "/guide/getting-first-clients",
  ];

  return staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency:
      path === "/" ? "weekly" :
      path.startsWith("/guide") ? "monthly" :
      "monthly",
    priority:
      path === "/" ? 1 :
      path.startsWith("/guide") ? 0.8 :
      path === "/cleaning" ? 0.9 :
      path === "/beauty" ? 0.9 :
      path === "/home_services" ? 0.9 :
      0.7,
  }));
}
