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
          "/:path((?!(?:about|pricing|gallery|schedule|booking)$)(?!_next/)(?!api/).+)",
        has: [
          {
            type: "host",
            value: "(?!www\\.)[a-z0-9-]+\\.simplebookme\\.com",
          },
        ],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
