import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instagram Bio Link Generator for Booking Pages | SimpleBookMe",
  description:
    "Create a booking link for your Instagram bio and turn followers into customers. Build a professional bio link page where clients can view your services and book instantly.",

  keywords: [
    "instagram bio link generator",
    "instagram booking link",
    "booking link for instagram bio",
    "instagram booking page",
    "link in bio booking",
    "instagram bio link for business",
    "how to add booking to instagram",
    "instagram bio link for services",
    "booking page for instagram",
    "link in bio tool for business",
  ],

  alternates: {
    canonical: "https://simplebookme.com/instagram_setup",
  },

  openGraph: {
    title: "Instagram Booking Link Generator",
    description:
      "Create a booking link for your Instagram bio and let customers book your services directly from your profile.",
    url: "https://simplebookme.com/instagram_setup",
    siteName: "SimpleBookMe",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Instagram Bio Link Generator",
    description:
      "Turn your Instagram bio into a booking page and convert followers into customers.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function InstagramSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}