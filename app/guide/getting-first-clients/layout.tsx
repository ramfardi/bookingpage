import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Get Your First Clients | Small Business Growth Guide",
  description:
    "Step-by-step guide for solo business owners on how to get their first clients. Learn proven strategies including referrals, Google optimization, social proof, local marketing, and a 30-day action plan.",
  keywords: [
    "how to get first clients",
    "how to get clients for small business",
    "getting first customers service business",
    "client acquisition for solo business",
    "how to get clients for hairdresser",
    "how to get clients for cleaning business",
    "small business marketing for beginners",
    "first customers strategy",
  ],
  alternates: {
    canonical: "https://simplebookme.com/guide/getting-first-clients",
  },
  openGraph: {
    title: "How to Get Your First Clients",
    description:
      "Practical strategies to attract your first 10–20 customers as a solo service business owner.",
    url: "https://simplebookme.com/guide/getting-first-clients",
    siteName: "SimpleBookMe",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "How to Get Your First Clients",
    description:
      "Proven methods to acquire your first customers and grow your service business.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GettingFirstClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
