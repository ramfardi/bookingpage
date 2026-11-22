/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.simplebookme.com" }],
        destination: "https://simplebookme.com/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      /*
       * SEO: customer subdomains ({sub}.simplebookme.com) also answer
       * every marketing route (/guide/*, /beauty, /tools, calculators,
       * ...), showing SimpleBookMe content or "only visible on the main
       * website". Keep those out of Google on subdomains.
       *
       * Not affected (stay indexable on subdomains): the customer's own
       * pages "/", /about, /pricing, /gallery, /schedule, /booking, which
       * set their own metadata, plus /_next and /api.
       * Not affected at all: simplebookme.com and www.
       */
      {
        source:
          "/:path((?!(?:about|pricing|gallery|schedule|booking|robots\\.txt|sitemap\\.xml)$)(?!_next/)(?!api/).+)",
        has: [
          {
            type: "host",
            value: "(?!www\\.)[a-z0-9-]+\\.simplebookme\\.com",
          },
        ],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },

      /*
       * SEO + privacy (H4): private pages on every host.
       * - Editor and its preview pages, edit links (?token=...),
       *   activation links, Stripe/support return pages.
       * - noindex, but NOT disallowed in robots.txt: Google has to be
       *   able to fetch a page to see its noindex.
       * - no-referrer on token links, so the URL (with its token) is
       *   never sent to other sites in the Referer header.
       * Listed after the subdomain rule so these values win on subdomains.
       */
      ...[
        "/site/:path*",
        "/availability/:siteId/edit",
        "/pricing_page/:siteId/edit",
        "/cleaning/quote-gen/:siteId/edit",
        "/activate/:path*",
        "/product-activation/:path*",
      ].map((source) => ({
        source,
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      })),

      ...["/success", "/cancel", "/support/success"].map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      })),
    ];
  },
};

export default nextConfig;
