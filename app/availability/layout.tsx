import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Weekly Availability Link Generator | Shareable & Editable Calendar | SimpleBookMe",
  description:
    "Create a dynamic weekly availability calendar and share it with a simple link. Let clients view your schedule, update your hours anytime, and share via Instagram, WhatsApp, or QR code. Perfect for freelancers and service businesses.",

  keywords: [
    "availability link generator",
    "weekly availability calendar",
    "share availability schedule",
    "availability calendar link",
    "editable availability calendar",
    "dynamic availability scheduler",
    "share working hours online",
    "availability page for clients",
    "availability link for business",
    "instagram availability link",
    "qr code for availability link",
    "weekly schedule generator",
    "simple booking availability",
    "freelancer availability page",
    "service business availability tool",
  ],

  alternates: {
    canonical: "https://simplebookme.com/availability",
  },

  openGraph: {
    title: "Free Weekly Availability Link Generator | SimpleBookMe",
    description:
      "Generate a shareable availability link with your weekly schedule. Update anytime and let clients easily view when you're available.",
    url: "https://simplebookme.com/availability",
    siteName: "SimpleBookMe",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Weekly Availability Link Generator",
    description:
      "Create and share your availability with a simple link. Perfect for freelancers and service businesses.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function AvailabilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}