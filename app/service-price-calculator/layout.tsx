import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Price Calculator for Small Businesses | SimpleBookMe",
  description:
    "Free service price calculator for small businesses. Estimate the right price for your services based on service time, monthly expenses, hourly income goals, and profit margin.",
  keywords: [
    "service price calculator",
    "how to price services",
    "service pricing calculator",
    "small business pricing calculator",
    "cleaning service price calculator",
    "hairdresser pricing calculator",
    "service pricing formula",
    "how much should I charge for services",
  ],
  alternates: {
    canonical: "https://simplebookme.com/service-price-calculator",
  },
  openGraph: {
    title: "Service Price Calculator for Small Businesses",
    description:
      "Estimate the ideal price for your services using real business numbers like time, expenses, and profit goals.",
    url: "https://simplebookme.com/service-price-calculator",
    siteName: "SimpleBookMe",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Service Price Calculator",
    description:
      "Free calculator to estimate profitable pricing for service businesses.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ServicePriceCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}