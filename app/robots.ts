import type { MetadataRoute } from "next";
import { getRequestHostname } from "./lib/getHostCustomer";

const MAIN_DOMAIN = "simplebookme.com";

/*
 * /robots.txt (H6). Previously missing: /robots.txt returned the 404 page.
 *
 * Only /api/ is blocked. Private pages (editor, edit and activation
 * links) are deliberately NOT disallowed here: they send noindex
 * (next.config.mjs headers + page metadata), and Google must be able
 * to fetch a page to see that. A disallowed URL can still be indexed
 * from links, just without its content.
 *
 * Host-aware because customer subdomains share this app:
 * - simplebookme.com: points crawlers at the main sitemap.
 * - {sub}.simplebookme.com: points at that subdomain's own sitemap,
 *   which lists only that business's pages (app/sitemap.ts).
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = await getRequestHostname();
  const isCustomerSubdomain = host.endsWith(`.${MAIN_DOMAIN}`);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: isCustomerSubdomain
      ? `https://${host}/sitemap.xml`
      : `https://${MAIN_DOMAIN}/sitemap.xml`,
  };
}
