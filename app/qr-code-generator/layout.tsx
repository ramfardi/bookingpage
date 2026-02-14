import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free QR Code Generator (PNG & SVG Download) | SimpleBookMe",
  description:
    "Generate high-resolution QR codes for your website, booking page, Google reviews, or social media. Download printable PNG or scalable SVG files for business cards and marketing materials.",
  keywords: [
    "QR code generator",
    "free QR code generator",
    "QR code for business card",
    "printable QR code",
    "QR code PNG download",
    "QR code SVG download",
    "QR code for website",
    "QR code for booking link",
    "business QR code generator",
  ],
  alternates: {
    canonical: "https://simplebookme.com/qr-code-generator",
  },
  openGraph: {
    title: "Free QR Code Generator (PNG & SVG Download)",
    description:
      "Create high-resolution, print-ready QR codes for business cards, flyers, and websites. Download as PNG or SVG.",
    url: "https://simplebookme.com/qr-code-generator",
    siteName: "SimpleBookMe",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Free QR Code Generator",
    description:
      "Generate printable QR codes in PNG and SVG format for your business.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function QRCodeGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
