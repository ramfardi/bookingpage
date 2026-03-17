import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affordable Booking Website Pricing | One-Time Fee | SimpleBookMe",
  description:
    "Get a professional booking website for a one-time fee. No subscriptions, no hidden costs. Perfect for small businesses, freelancers, and service providers.",

  keywords: [
    "booking website pricing",
    "one-time website fee",
    "no subscription website builder",
    "small business website cost",
    "booking system pricing",
    "affordable booking website",
    "website builder without monthly fee",
    "service business website pricing",
    "cheap booking website",
    "one-time payment website builder",
  ],

  alternates: {
    canonical: "https://simplebookme.com/pricing",
  },

  openGraph: {
    title: "Affordable Booking Website Pricing | One-Time Fee",
    description:
      "Create your booking website with a single payment. No recurring fees. Ideal for small businesses and freelancers.",
    url: "https://simplebookme.com/pricing",
    siteName: "SimpleBookMe",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "SimpleBookMe Pricing",
    description:
      "One-time payment booking website. No subscriptions or hidden fees.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}