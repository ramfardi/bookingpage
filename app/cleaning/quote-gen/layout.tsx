
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://simplebookme.com"),

  title:
    "Free Cleaning Quote Generator | Create Your Instant Quote Link | SimpleBookMe",

  description:
    "Create a professional cleaning quote calculator for your business. Set your own rates, customize services and extras, and share an instant quote link with customers. Start with a 14-day free trial.",

  keywords: [
    "cleaning quote generator",
    "free cleaning quote generator",
    "cleaning quote calculator",
    "cleaning estimate generator",
    "cleaning business quote generator",
    "cleaning price calculator",
    "cleaning service quote tool",
    "cleaning quote link",
    "instant cleaning quote",
    "house cleaning estimate calculator",
    "maid service pricing calculator",
    "cleaning business pricing tool",
    "cleaning estimate form",
    "cleaning service pricing",
    "commercial cleaning quote calculator",
    "move out cleaning quote",
    "residential cleaning pricing",
    "custom cleaning quote calculator",
    "online cleaning quote form",
    "cleaning business software",
  ],

  alternates: {
    canonical:
      "https://simplebookme.com/cleaning/quote-gen",
  },

  openGraph: {
    title:
      "Create Your Own Cleaning Quote Calculator | SimpleBookMe",

    description:
      "Build a customizable cleaning quote page in minutes. Set your prices, add cleaning services, and share one link so customers can get instant estimates.",

    url:
      "https://simplebookme.com/cleaning/quote-gen",

    siteName: "SimpleBookMe",

    type: "website",

    locale: "en_US",
  },

  twitter: {
    card: "summary",

    title:
      "Cleaning Quote Generator | SimpleBookMe",

    description:
      "Create your own cleaning quote calculator, customize pricing, and share an instant quote link with customers.",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function CleaningQuoteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
