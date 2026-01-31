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
};

export default nextConfig;
