export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://simplebookme.com";

  const staticPages = [
    "/",
    "/about",
    "/pricing",

    "/tools",
    "/qr-code-generator",
    "/google_review_qr",
    "/flyer",
    "/calendar",
    "/cleaning-pricing-calculator",
    "/advertising-budget-calculator",
    "/service-price-calculator",
    "/availability",

    "/cleaning",
    "/beauty",
    "/cleaning/quote-gen",

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
    lastModified: path === "/" ? new Date() : new Date("2026-01-01"),
    changeFrequency:
      path === "/" ? "weekly" :
      path.startsWith("/guide") ? "monthly" :
      "monthly",
    priority:
      path === "/" ? 1 :
      path === "/tools" || path.startsWith("/tools/") ? 0.9 :
      path === "/cleaning" || path === "/beauty" ? 0.9 :
      0.7,
  }));
}