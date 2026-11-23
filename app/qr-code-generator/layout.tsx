import type { Metadata } from "next";
import { QR_CODE_LANGUAGES } from "@/app/lib/hreflang";

/*
 * This page is the general QR code generator (its h1: "Free QR Code
 * Generator (PNG & SVG) for Business Cards & Branding"), and the English
 * version of the /fr, /es, /fa and /ar QR pages.
 *
 * Its metadata used to describe a Google *review* QR generator, the same
 * topic as /google_review_qr, so the two pages competed for the same
 * searches and the title didn't match the content. Google review QR
 * codes stay with /google_review_qr.
 *
 * Structured data lives in page.tsx (it duplicated here, pointing at
 * /google_review_qr).
 */
export const metadata: Metadata = {
  title: "Free QR Code Generator (PNG & SVG Download) | SimpleBookMe",
  description:
    "Create high-resolution QR codes for your website, booking page, social media or business cards. Free, no login. Download printable PNG or scalable SVG files.",
  keywords: [
    "qr code generator",
    "free qr code generator",
    "qr code for business card",
    "printable qr code",
    "qr code png download",
    "qr code svg download",
    "qr code for website",
    "qr code for booking link",
    "business qr code generator",
  ],
  alternates: {
    canonical: "https://simplebookme.com/qr-code-generator",
    languages: QR_CODE_LANGUAGES,
  },
  openGraph: {
    title: "Free QR Code Generator (PNG & SVG)",
    description:
      "Create printable QR codes for business cards, flyers and websites. Download as PNG or SVG.",
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
  return children;
}
