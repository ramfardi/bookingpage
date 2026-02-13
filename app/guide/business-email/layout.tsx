import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Professional Business Email | Small Business Setup Guide",
  description:
    "Learn how to create a professional business email using your own domain. Step-by-step guide covering domain purchase, Google Workspace setup, verification, costs, and best practices for solo business owners.",
  keywords: [
    "business email setup",
    "create professional email",
    "custom domain email",
    "Google Workspace business email",
    "how to create business email",
    "email for small business",
    "professional email address guide",
  ],
  alternates: {
    canonical: "https://simplebookme.com/guide/business-email",
  },
  openGraph: {
    title: "Create a Professional Business Email",
    description:
      "Step-by-step guide to setting up a professional business email with your own domain. Learn domain purchase, email hosting, verification, and best practices.",
    url: "https://simplebookme.com/guide/business-email",
    siteName: "SimpleBookMe",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Create a Professional Business Email",
    description:
      "Complete guide to creating a professional email address for your small business.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BusinessEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
