import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import { Providers } from "./providers";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Create a Booking Website & Instagram Bio Link | No Monthly Fee | SimpleBookMe",
description:
  "Create a professional booking website for cleaners, hair salons, beauty businesses, handymen and service professionals. Accept bookings online, display pricing, showcase before & after portfolios, availability calendars, testimonials, Google reviews, contact information and social media links. No monthly fees.",

keywords: [
  "booking website builder",
  "appointment booking website",
  "online booking system",
  "service business website",

  "cleaning business website",
  "hair salon website",
  "beauty salon website",
  "handyman website",
  "landscaping website",

  "availability calendar",
  "booking calendar",
  "online appointment scheduling",

  "before and after gallery",
  "portfolio website for service business",
  "customer testimonial website",
  "google review showcase",

  "instagram booking page",
  "instagram bio link",
  "tiktok booking page",

  "small business website",
  "website builder for service business",
  "no monthly fee website builder",
],

  alternates: {
    canonical: "https://simplebookme.com",
  },

	openGraph: {
	  title:
		"Create a Booking Website & Instagram Bio Link | SimpleBookMe",

	  description:
		"Build a booking website for your service business and turn your Instagram bio into a booking page.",

	  url: "/",

	  siteName: "SimpleBookMe",

	  type: "website",

	  images: [
		{
		  url: "/images/og-home.jpg",
		  width: 1200,
		  height: 630,
		  alt: "SimpleBookMe Booking Website Builder",
		},
	  ],
	},
  
    icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon_192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/favicon_180.png", sizes: "180x180", type: "image/png" },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Create a Booking Website & Instagram Bio Link",
    description:
      "Launch a booking website for your business and turn your Instagram bio into a booking link. No monthly fees.",
  },

  robots: {
    index: true,
    follow: true,
  },
  
    other: {
    "google-site-verification": "_9XPHh7SY5Gvnydgm5jhkLwhbaswIr3RsACqQhq580A",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

const host = (await headers()).get("host") || "";

// adjust this if needed
const isSubdomain =
  host !== "simplebookme.com" &&
  !host.startsWith("www.");

  return (
    <html lang="en">
      <head>
        {/* Google Ads / Google Tag */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-17894933160"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17894933160');
            `,
          }}
        />
		
		<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",

  name: "SimpleBookMe",

  applicationCategory: "BusinessApplication",

  operatingSystem: "Web",

  url: "https://simplebookme.com",

  image: "https://simplebookme.com/images/og-home.jpg",

  description:
    "Booking website builder for cleaners, hair salons, beauty businesses, handymen and service professionals.",

  featureList: [
    "Online booking",
    "Availability calendar",
    "Instagram bio link",
    "Portfolio gallery",
    "Before and after slider",
    "Video portfolio",
    "Google Maps location",
    "Testimonials",
    "Google review links",
    "Social media links",
    "Pricing display",
    "Contact section",
  ],

  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CAD",
  },

  creator: {
    "@type": "Organization",
    name: "SimpleBookMe",
    url: "https://simplebookme.com",
  },
}),
  }}
/>
		
      </head>

      <body className="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Providers>
          {/* Navbar is client-side and resolves mode async */}

		  <Navbar />

          {/* Offset for fixed navbar height */}
          <main className="pt-16 min-h-screen">
            {children}
          </main>
        </Providers>
		<Analytics />
		<SpeedInsights />
		
      </body>
    </html>
  );
}
