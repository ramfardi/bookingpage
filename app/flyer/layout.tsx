import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Promo Flyer Generator (Instagram & PNG Download) | SimpleBookMe",
  description:
    "Create high-converting promo flyers for Instagram, TikTok, and social media in seconds. Customize discount offers, add contact details, and download ready-to-post PNG images for your business.",
  keywords: [
    "promo flyer maker",
	"free flyer maker",
    "instagram flyer maker",
    "instagram story flyer",
    "sale post generator",
    "discount flyer generator",
    "marketing flyer creator",
    "business promotion template",
    "instagram post design tool",
    "social media flyer maker",
    "png flyer generator",
  ],
  alternates: {
    canonical: "https://simplebookme.com/flyer",
  },
  openGraph: {
    title: "Free Promo Flyer Generator (Instagram Ready)",
    description:
      "Design professional promo flyers for Instagram and social media. Add discounts, text, and contact info. Download instantly as PNG.",
    url: "https://simplebookme.com/flyer",
    siteName: "SimpleBookMe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Promo Flyer Generator for Instagram",
    description:
      "Create eye-catching promotional flyers with discounts and contact info. Perfect for Instagram and marketing.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FlyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}