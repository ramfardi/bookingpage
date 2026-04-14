import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://simplebookme.com";
  const now = new Date();

  const staticPages = [
    "/",
    "/about",
    "/pricing",
	"/tools",
	"/qr-code-generator",
	"/instagram_setup",
	"/google_review_qr",
	"/flyer",
	"/calendar",
	"/google_review_qr",
	"/cleaning-pricing-calculator",
	"/advertising-budget-calculator",
	"/service-price-calculator",
	"/availability",

    // Category landing pages
    "/cleaning",
    "/beauty",
	"/cleaning/quote-gen",

    // Guide hub
    "/guide",
    "/guide/google-business",
    "/guide/business-email",
    "/guide/pricing-guide",
    "/guide/payment-methods",
    "/guide/getting-first-clients",
	
	"/fr/calculateur-budget-publicitaire",
	"/fr/generateur-code-qr",
	"/es/calculadora-presupuesto-publicidad",
	"/es/generador-codigo-qr",
	"/fa/generator-qr-code",
	"/ar/generator-qr-code",
	
	
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
	  path.startsWith("/tools") ? 0.9 :
      path === "/cleaning" ? 0.9 :
      path === "/beauty" ? 0.9 :
      0.7,
  }));
}
