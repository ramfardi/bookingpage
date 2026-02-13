import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Accept Payments (Machines, Online, Fees & Tax) | Small Business Guide",
  description:
    "Complete guide for small business owners on how to accept payments. Compare card machines like Square, Stripe Terminal, Clover, and SumUp. Learn about online payments, fees, costs, and tax implications.",
  keywords: [
    "how to accept payments small business",
    "best card machine for small business",
    "Square vs Stripe fees",
    "payment processing fees comparison",
    "online payments for service business",
    "tax implications of card payments",
    "small business payment methods",
    "Stripe Terminal vs Square Reader",
  ],
  alternates: {
    canonical: "https://simplebookme.com/guide/payment-methods",
  },
  openGraph: {
    title: "How to Accept Payments (Machines, Online, Fees & Tax)",
    description:
      "Compare payment machines and online methods for small businesses. Learn transaction fees, monthly costs, and bookkeeping best practices.",
    url: "https://simplebookme.com/guide/payment-methods",
    siteName: "SimpleBookMe",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "How to Accept Payments (Machines, Online, Fees & Tax)",
    description:
      "Step-by-step guide to choosing the right payment setup for your solo business.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PaymentMethodsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
