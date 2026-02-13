import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertising for Small Businesses | Complete Marketing Guide",
  description:
    "Learn how to advertise a small service business using TikTok, Instagram, Facebook, Google Ads, and traditional marketing methods. Step-by-step strategies, budgeting tips, and proven ways to attract more clients.",
  keywords: [
    "advertising for small business",
    "how to advertise a service business",
    "small business marketing strategies",
    "Google Ads for small business",
    "TikTok marketing for local business",
    "Instagram advertising tips",
    "Facebook ads for service business",
    "local business advertising ideas",
    "low budget marketing small business",
  ],
  alternates: {
    canonical: "https://simplebookme.com/guide/advertising-small-business",
  },
  openGraph: {
    title: "Advertising for Small Businesses",
    description:
      "Practical advertising strategies for solo business owners. Compare online ads and traditional marketing methods to grow your client base.",
    url: "https://simplebookme.com/guide/advertising-small-business",
    siteName: "SimpleBookMe",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Advertising for Small Businesses",
    description:
      "Step-by-step advertising strategies for local service businesses.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AdvertisingGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
