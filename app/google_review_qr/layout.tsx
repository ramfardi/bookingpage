import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Review QR Code Generator (Free PNG & SVG) | SimpleBookMe",
  description:
    "Generate a QR code that sends customers directly to your Google review page. Download high-resolution PNG or SVG QR codes to increase reviews and build trust for your business.",

  keywords: [
    "google review qr code",
    "qr code for google reviews",
    "google review link qr code",
    "google review generator",
    "how to get google review link",
    "qr code for reviews",
    "increase google reviews",
    "google review qr generator",
    "review qr code for business",
    "free qr code for google reviews",
  ],

  alternates: {
    canonical: "https://simplebookme.com/google_review_qr",
  },

  openGraph: {
    title: "Google Review QR Code Generator (Free PNG & SVG)",
    description:
      "Create QR codes that send customers directly to your Google review page. Increase reviews and improve your business reputation.",
    url: "https://simplebookme.com/google_review_qr",
    siteName: "SimpleBookMe",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Google Review QR Code Generator",
    description:
      "Generate QR codes that help customers leave Google reviews instantly.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function GoogleReviewQRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}