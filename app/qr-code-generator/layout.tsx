import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Review QR Code Generator (Find Your Business Instantly) | SimpleBookMe",
  description:
  "Generate a Google review QR code instantly by searching your business name. No login required. Create branded QR codes, download printable designs, and get more customer reviews.",
keywords: [
  "google review qr code generator",
  "qr code for google reviews",
  "how to get google review link",
  "generate google review qr code free",
  "qr code for business reviews",
  "google review link generator",
  "qr code to get more reviews",
  "review qr code for small business",
  "scan to leave review qr code",
],
  alternates: {
    canonical: "https://simplebookme.com/qr-code-generator",
  },
openGraph: {
  title: "Google Review QR Code Generator (Search Your Business Instantly)",
  description:
    "Find your business and generate a Google review QR code in seconds. Create printable cards and increase customer reviews.",
  url: "https://simplebookme.com/google_review_qr",
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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Google Review QR Code Generator",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Generate Google review QR codes by searching your business name. Create branded, printable QR designs to increase customer reviews.",
            url: "https://simplebookme.com/google_review_qr",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />

      {children}
    </>
  );
}
