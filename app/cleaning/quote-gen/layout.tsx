import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cleaning Quote Generator | Instant Cleaning Price Calculator | SimpleBookMe",
  description:
    "Generate instant cleaning service quotes with a customizable pricing calculator. Perfect for house cleaners, maid services, and commercial cleaning businesses. Let customers estimate prices based on property size, services, and add-ons.",

  keywords: [
    "cleaning quote generator",
    "cleaning price calculator",
    "cleaning service quote tool",
    "house cleaning estimate calculator",
    "maid service pricing calculator",
    "cleaning business pricing tool",
    "cleaning estimate generator",
    "cleaning quote form",
    "cleaning service pricing",
    "how to price cleaning services",
    "commercial cleaning quote",
    "move out cleaning cost calculator",
    "cleaning quote link",
    "instant cleaning quote",
  ],

  alternates: {
    canonical: "https://simplebookme.com/cleaning/quote-gen",
  },

  openGraph: {
    title: "Cleaning Quote Generator | SimpleBookMe",
    description:
      "Create instant cleaning quotes for your clients. Let customers calculate pricing based on their needs and increase conversions with a professional quote tool.",
    url: "https://simplebookme.com/cleaning/quote-gen",
    siteName: "SimpleBookMe",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Cleaning Quote Generator",
    description:
      "Generate instant cleaning quotes and simplify your pricing process.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function CleaningQuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}