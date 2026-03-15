import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Services Website & Booking System | SimpleBookMe",
  description:
    "Create a professional website for your home service business and accept bookings online. Perfect for plumbers, electricians, handymen, HVAC technicians, and home repair professionals. Display services, pricing, and scheduling with no monthly fees.",

  keywords: [
    "home services website",
    "home service booking system",
    "handyman booking website",
    "plumber booking website",
    "electrician booking website",
    "hvac booking website",
    "home repair website builder",
    "home service scheduling system",
    "website for home service business",
    "online booking for home services",
    "home service appointment scheduling",
    "home service website builder",
    "service business website",
    "no monthly fee service website",
  ],

  alternates: {
    canonical: "https://simplebookme.com/home_services",
  },

  openGraph: {
    title: "Home Services Website & Booking System | SimpleBookMe",
    description:
      "Build a professional website for your home service business and accept bookings online. Ideal for plumbers, electricians, HVAC technicians, and handymen.",
    url: "https://simplebookme.com/home_services",
    siteName: "SimpleBookMe",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Home Services Website Builder",
    description:
      "Create a website and booking system for plumbers, electricians, handymen, and home service professionals.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function HomeServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}