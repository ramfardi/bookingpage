import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beauty Booking Website Builder | Hair, Nail & Spa Scheduling | SimpleBookMe",
  description:
    "Create a professional beauty booking website for your salon, spa, or freelance beauty business. Accept appointments online, display services and pricing, and turn your Instagram bio into a booking link with no monthly fees.",

  keywords: [
    "beauty booking website",
    "salon booking website",
    "hair salon booking system",
    "nail salon booking website",
    "spa booking website",
    "beauty appointment scheduling",
    "beauty business website",
    "booking website for beauty business",
    "hair stylist booking website",
    "beauty instagram booking link",
    "booking page for salon",
    "beauty service booking system",
    "beauty business website builder",
    "no monthly fee salon website",
  ],

  alternates: {
    canonical: "https://simplebookme.com/beauty",
  },

  openGraph: {
    title: "Beauty Booking Website Builder | SimpleBookMe",
    description:
      "Create a booking website for your beauty business. Perfect for hair salons, nail artists, spas, and beauty professionals. Accept bookings online with no monthly fees.",
    url: "https://simplebookme.com/beauty",
    siteName: "SimpleBookMe",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Beauty Booking Website Builder",
    description:
      "Create a professional booking website for your salon, spa, or beauty business.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function BeautyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}