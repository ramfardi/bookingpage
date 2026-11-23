import type { Metadata } from "next";

// Without its own metadata, /setup inherited the homepage title and
// canonical (https://simplebookme.com).
export const metadata: Metadata = {
  title: "Create Your Booking Website | Get Started | SimpleBookMe",
  description:
    "Set up your booking website in minutes: choose your business type, add your services and prices, and start accepting appointments online.",
  alternates: {
    canonical: "https://simplebookme.com/setup",
  },
  openGraph: {
    title: "Create Your Booking Website | SimpleBookMe",
    description:
      "Choose your business type, add your services and start accepting online bookings.",
    url: "https://simplebookme.com/setup",
    siteName: "SimpleBookMe",
    type: "website",
  },
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
