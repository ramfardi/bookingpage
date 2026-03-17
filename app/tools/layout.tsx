import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Business Tools for Small Businesses | SimpleBookMe",
  description:
    "Free tools for small businesses including a QR code generator, service price calculator, and advertising budget calculator. Designed to help service businesses grow and operate more efficiently.",

  keywords: [
    "free business tools",
    "small business tools",
    "QR code generator for business",
	"Instagram bio link",
    "service price calculator",
    "advertising budget calculator",
    "small business pricing calculator",
    "business marketing calculator",
    "tools for service businesses",
	"google review link qr code",
    "business tools for freelancers",
    "free tools for entrepreneurs",
  ],

  alternates: {
    canonical: "https://simplebookme.com/tools",
  },

  openGraph: {
    title: "Free Business Tools for Small Businesses",
    description:
      "Access free tools including a QR code generator, service price calculator, and advertising budget calculator to help your business grow.",
    url: "https://simplebookme.com/tools",
    siteName: "SimpleBookMe",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Free Business Tools",
    description:
      "Practical tools for service businesses including pricing and marketing calculators.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}