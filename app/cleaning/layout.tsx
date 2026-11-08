
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Cleaning Quote Generator for Cleaning Businesses | SimpleBookMe",

  description:
    "Create your own online cleaning quote calculator in minutes. Customize cleaning rates, property types, services, and extras. Share one link so customers can get instant cleaning estimates. Just $9.99 USD, one-time payment.",

  keywords: [
    "cleaning quote generator",
    "cleaning quote calculator",
    "online cleaning estimate calculator",
    "cleaning business quote generator",
    "house cleaning estimate calculator",
    "cleaning service pricing calculator",
    "cleaning business pricing tool",
    "instant cleaning quotes",
    "cleaning quote website",
    "cleaning quote link",
    "maid service quote calculator",
    "cleaning business software",
    "custom cleaning quote form",
    "cleaning estimate tool",
    "cleaning business tools",
    "cleaning quote calculator no monthly fee",
  ],

  applicationName: "SimpleBookMe",

  alternates: {
    canonical: "https://simplebookme.com/cleaning",
  },

  openGraph: {
    title:
      "Cleaning Quote Generator — Create & Share Your Own Quote Page",

    description:
      "Stop calculating every cleaning estimate manually. Build a customizable cleaning quote page, set your rates, and let customers calculate estimated prices instantly. Only $9.99 USD, one-time.",

    url: "https://simplebookme.com/cleaning",

    siteName: "SimpleBookMe",

    type: "website",

    locale: "en_US",

    images: [
      {
        url: "https://simplebookme.com/images/cleaning.jpg",
        alt: "SimpleBookMe Cleaning Quote Generator",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Cleaning Quote Generator for Your Business | SimpleBookMe",

    description:
      "Create a customizable cleaning quote calculator, set your prices, and share your own quote link. $9.99 USD one-time.",

    images: [
      "https://simplebookme.com/images/cleaning.jpg",
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "business",
};

export default function CleaningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
