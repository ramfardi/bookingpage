import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cleaning Business Website, Quote Generator & Booking System | SimpleBookMe",
  description:
    "Create a complete online system for your cleaning business. Generate instant cleaning quotes, share a live weekly availability calendar, and accept bookings with built-in email notifications. Includes free tools like QR codes to help grow your business.",

  keywords: [
    "cleaning business website",
    "cleaning quote generator",
    "cleaning availability calendar",
    "cleaning booking system",
    "house cleaning booking website",
    "maid service scheduling",
    "cleaning service pricing tool",
    "cleaning appointment booking",
    "cleaning quote link",
    "availability calendar for cleaning business",
    "online booking for cleaning services",
    "cleaning website builder",
    "cleaning business tools",
    "QR code for cleaning business",
    "cleaning service website no monthly fee",
  ],

  alternates: {
    canonical: "https://simplebookme.com/cleaning",
  },

  openGraph: {
    title: "Cleaning Business Tools: Quotes, Availability & Booking | SimpleBookMe",
    description:
      "All-in-one platform for cleaning businesses. Let customers generate quotes, check your availability, and book appointments online. Includes free tools like QR codes to attract more clients.",
    url: "https://simplebookme.com/cleaning",
    siteName: "SimpleBookMe",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Cleaning Business Tools & Booking System",
    description:
      "Quote generator, availability calendar, and booking website for cleaning services.",
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