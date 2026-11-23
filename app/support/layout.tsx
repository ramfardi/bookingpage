import type { Metadata } from "next";

// Without its own metadata, /support inherited the homepage title and
// canonical (https://simplebookme.com), so Google saw it as a duplicate
// of the homepage.
export const metadata: Metadata = {
  title: "Contact Support | SimpleBookMe",
  description:
    "Need help with your SimpleBookMe booking website? Send the support team a message and we'll get back to you as soon as possible.",
  alternates: {
    canonical: "https://simplebookme.com/support",
  },
  openGraph: {
    title: "Contact SimpleBookMe Support",
    description: "Get help with your SimpleBookMe booking website.",
    url: "https://simplebookme.com/support",
    siteName: "SimpleBookMe",
    type: "website",
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
