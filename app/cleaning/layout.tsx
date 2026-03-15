import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cleaning Business Website & Booking System | SimpleBookMe",
  description:
    "Create a professional cleaning service website with online booking. Perfect for house cleaning, maid services, and commercial cleaners. Show services, pricing, and accept appointments online with no monthly fees.",

  keywords: [
    "cleaning business website",
    "cleaning booking website",
    "house cleaning booking system",
    "maid service booking website",
    "cleaning service scheduling",
    "cleaning website builder",
    "cleaning appointment booking",
    "website for cleaning business",
    "cleaning company website",
    "online booking for cleaning services",
    "cleaning business scheduling system",
    "cleaning service website builder",
    "cleaning booking page",
    "cleaning service website no monthly fee",
  ],

  alternates: {
    canonical: "https://simplebookme.com/cleaning",
  },

  openGraph: {
    title: "Cleaning Business Website & Booking System | SimpleBookMe",
    description:
      "Build a professional website for your cleaning business and accept bookings online. Perfect for house cleaners, maid services, and commercial cleaning companies.",
    url: "https://simplebookme.com/cleaning",
    siteName: "SimpleBookMe",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Cleaning Business Website Builder",
    description:
      "Create a cleaning service website with online booking and scheduling.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function CleaningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}