import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Business Guide: Add Your Business to Google Maps & Create a Business Email",
    description:
      "Beginner-friendly step-by-step guide to add your business to Google Maps using a Gmail or Google account, create a professional business email, and get ready for online bookings.",
    keywords: [
      "add business to google maps",
      "google business profile",
      "how to list business on google maps",
      "create business email",
      "google workspace email",
      "small business setup",
      "local business google maps",
      "online booking for small business",
    ],
    alternates: {
      canonical: "https://simplebookme.com/guide",
    },
    openGraph: {
      title: "Business Guide for Small Businesses",
      description:
        "Learn how to add your business to Google Maps, create a professional business email, and prepare for online bookings.",
      url: "https://simplebookme.com/guide",
      siteName: "SimpleBookMe",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "Business Guide: Google Maps & Business Email Setup",
      description:
        "Step-by-step beginner guide to list your business on Google Maps and create a professional business email.",
    },
  };
}

export default function BusinessGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
