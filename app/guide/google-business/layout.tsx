import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Your Business to Google Maps | Small Business Setup Guide",
  description:
    "Step-by-step guide to adding your business to Google Maps using Google Business Profile. Learn how to verify your business, optimize your listing, get reviews, and attract more local customers.",
  keywords: [
    "add business to Google Maps",
    "Google Business Profile guide",
    "how to list business on Google",
    "Google My Business setup",
    "local business SEO",
    "Google Maps business listing",
  ],
  alternates: {
    canonical: "https://simplebookme.com/guide/google-business",
  },
  openGraph: {
    title: "Add Your Business to Google Maps",
    description:
      "Learn how to create and optimize your Google Business Profile to attract more local customers and improve your visibility on Google Search and Maps.",
    url: "https://simplebookme.com/guide/google-business",
    siteName: "SimpleBookMe",
    type: "article",
    images: [
      {
        url: "https://simplebookme.com/images/guide/google/step1.png",
        width: 1200,
        height: 630,
        alt: "Google Business Profile dashboard example",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Your Business to Google Maps",
    description:
      "Complete step-by-step guide to setting up and optimizing your Google Business Profile.",
    images: [
      "https://simplebookme.com/images/guide/google/step1.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GoogleBusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
