import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Availability Calendar Generator (Instagram Ready) | SimpleBookMe",

  description:
    "Create beautiful weekly availability calendars for Instagram, WhatsApp, and booking pages. Add your working hours, services, and contact info, then download high-quality images instantly.",

  keywords: [
    "availability calendar generator",
    "instagram availability story",
    "weekly availability template",
    "booking schedule generator",
    "availability planner image",
    "service business availability",
    "instagram story schedule",
    "beauty salon availability template",
    "hair stylist schedule template",
    "freelancer availability calendar",
    "appointment availability image",
    "business availability poster",
  ],

  alternates: {
    canonical: "https://simplebookme.com/calendar",
  },

  openGraph: {
    title: "Free Availability Calendar Generator (Instagram Ready)",
    description:
      "Design and download professional availability calendars for your business. Perfect for Instagram stories and client booking.",
    url: "https://simplebookme.com/calendar",
    siteName: "SimpleBookMe",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Availability Calendar Generator",
    description:
      "Create and download Instagram-ready availability schedules for your business.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}