
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://simplebookme.com"),

  title:
    "Free Pricing Page Generator | Create & Share Your Price List | SimpleBookMe",

  description:
    "Create a professional pricing page for your business in minutes. Add services, prices, descriptions, your logo, and contact details. Share your personalized pricing link with customers. Start with a 14-day free trial.",

  keywords: [
    "pricing page generator",
    "free pricing page generator",
    "online price list maker",
    "service price list generator",
    "business pricing page",
    "create a pricing page",
    "shareable price list",
    "digital price list",
    "service pricing template",
    "online service menu",
    "small business pricing tool",
    "custom pricing page",
    "price list website",
    "pricing page builder",
    "business price list",
    "hair salon price list",
    "beauty salon pricing page",
    "cleaning service price list",
    "personal trainer pricing",
    "freelancer pricing page",
    "SimpleBookMe",
  ],

  openGraph: {
    title:
      "Create Your Own Business Pricing Page | SimpleBookMe",

    description:
      "Build a beautiful, customizable pricing page. Add your services, set prices, upload your logo, and share one professional link with customers. Try it free for 14 days.",

    siteName: "SimpleBookMe",
    type: "website",
    locale: "en_US",
  },

  twitter: {
    card: "summary",

    title:
      "Pricing Page Generator | SimpleBookMe",

    description:
      "Create a professional online price list for your business. Customize services, prices, and branding, then share your own pricing link.",
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

export default function PricingPageLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
