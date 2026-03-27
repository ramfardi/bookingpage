import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Cleaning Service Pricing Calculator (Free Tool for House Cleaning Rates) | SimpleBookMe",
  description:
    "Free cleaning service pricing calculator. Estimate how much to charge for house cleaning based on time, costs, and profit margin. Perfect for solo cleaners and small cleaning businesses.",
  keywords: [
    "cleaning service pricing calculator",
    "house cleaning rates calculator",
    "how much to charge for cleaning",
    "cleaning service pricing",
    "cleaning business pricing tool",
    "deep cleaning pricing",
    "cleaning cost estimator",
    "price cleaning jobs",
  ],
  alternates: {
    canonical:
      "https://simplebookme.com/cleaning-pricing-calculator",
  },
  openGraph: {
    title:
      "Cleaning Service Pricing Calculator (House Cleaning Rates)",
    description:
      "Calculate profitable cleaning service prices based on your time, expenses, and desired income. Ideal for independent cleaners and small businesses.",
    url: "https://simplebookme.com/cleaning-pricing-calculator",
    siteName: "SimpleBookMe",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Cleaning Service Pricing Calculator",
    description:
      "Estimate how much to charge for cleaning services with this free calculator.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CleaningPricingCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}