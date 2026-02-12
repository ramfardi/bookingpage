import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About SimpleBookMe | Booking Website for Small Businesses",
  description:
    "Learn about SimpleBookMe — an easy-to-use booking website builder for small businesses. Create your own professional appointment booking website in minutes with no monthly fees.",

  keywords: [
    "SimpleBookMe",
    "booking website",
    "appointment booking website",
    "small business booking software",
    "beauty salon booking website",
    "cleaning service booking website",
    "online appointment system",
  ],

  metadataBase: new URL("https://simplebookme.com"),

  alternates: {
    canonical: "/about",
  },

  openGraph: {
    title: "About SimpleBookMe | Booking Website for Small Businesses",
    description:
      "SimpleBookMe helps small businesses create professional booking websites with online appointment scheduling.",
    url: "https://simplebookme.com/about",
    siteName: "SimpleBookMe",
    images: [
      {
        url: "/images/hero-default.png", // Make sure this exists in /public/images
        width: 1200,
        height: 630,
        alt: "SimpleBookMe Booking Website Builder",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "About SimpleBookMe",
    description:
      "Create a professional booking website for your small business in minutes.",
    images: ["/images/hero-default.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
