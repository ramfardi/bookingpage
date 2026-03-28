import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Business Card Generator with QR Code | Print Ready 3.5x2 | SimpleBookMe",

  description:
    "Create a professional business card with QR code in seconds. Generate print-ready 3.5x2 inch business cards with your name, contact details, and booking link. Perfect for service businesses.",

  keywords: [
    "business card generator",
    "free business card generator",
    "business card with QR code",
    "print ready business card 3.5x2",
    "QR code business card",
    "create business card online",
    "business card maker",
    "service business card generator",
    "booking QR code business card",
    "professional business card design",
    "business card template",
    "small business marketing tools"
  ],

  alternates: {
    canonical: "https://simplebookme.com/tools/business-card",
  },

  openGraph: {
    title: "Free Business Card Generator with QR Code",
    description:
      "Design and download print-ready business cards with QR codes for your website or booking page.",
    url: "https://simplebookme.com/tools/business-card",
    siteName: "SimpleBookMe",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Free Business Card Generator",
    description:
      "Create print-ready business cards with QR codes for your business.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function BusinessCardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}