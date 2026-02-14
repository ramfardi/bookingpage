import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertising Budget Calculator for Small Businesses | SimpleBookMe",
  description:
    "Free advertising budget calculator for small service businesses. Estimate how much you should spend on ads based on your service price, monthly visits, and profit margin.",
  keywords: [
    "advertising budget calculator",
    "marketing budget calculator",
    "small business advertising budget",
    "how much should I spend on ads",
    "ad budget for service business",
    "local business marketing budget",
    "google ads budget calculator",
    "small business marketing planning tool",
  ],
  alternates: {
    canonical: "https://simplebookme.com/advertising-budget-calculator",
  },
  openGraph: {
    title: "Advertising Budget Calculator for Small Businesses",
    description:
      "Calculate a safe and profitable advertising budget based on your real business numbers. Designed for solo and local service businesses.",
    url: "https://simplebookme.com/advertising-budget-calculator",
    siteName: "SimpleBookMe",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Advertising Budget Calculator",
    description:
      "Free marketing budget calculator for small business owners.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AdvertisingBudgetCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
