import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Set Your Prices Properly | Small Business Setup Guide",
  description:
    "Learn how to set your service prices properly as a solo business owner. Step-by-step guide covering cost calculation, profit margins, pricing strategies, common mistakes, and when to raise your rates.",
  keywords: [
    "how to set service prices",
    "pricing guide for small business",
    "how to price services properly",
    "service pricing strategy",
    "calculate hourly rate business",
    "profit margin for solo business",
    "pricing tips for hairdressers",
    "pricing tips for cleaners",
  ],
  alternates: {
    canonical: "https://simplebookme.com/guide/pricing-guide",
  },
  openGraph: {
    title: "How to Set Your Prices Properly",
    description:
      "Complete step-by-step pricing guide for solo business owners. Learn how to calculate costs, set profitable rates, and avoid common pricing mistakes.",
    url: "https://simplebookme.com/guide/pricing-guide",
    siteName: "SimpleBookMe",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "How to Set Your Prices Properly",
    description:
      "Practical pricing strategy guide for solo service businesses.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PricingGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
