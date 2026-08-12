import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import { Providers } from "./providers";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://simplebookme.com"),

  title:
    "Booking Website with Reminders & Review Follow-Ups | No Monthly Fee | SimpleBookMe",

  description:
    "Create a professional booking website for your service business. Accept appointments online, send booking confirmations, calendar invites and automatic appointment reminders, request Google reviews after appointments, display pricing, availability and portfolios — with no monthly fee.",

  keywords: [
    // Core booking
    "booking website builder",
    "appointment booking website",
    "online booking system",
    "online appointment scheduling",
    "service business website",
    "small business booking website",

    // Email automation
    "appointment reminder email",
    "automatic appointment reminders",
    "booking confirmation email",
    "appointment confirmation email",
    "customer appointment reminders",
    "automated booking reminders",

    // Reviews
    "automatic review request",
    "google review request",
    "google review follow up",
    "customer review request",
    "google review automation",

    // Calendar / scheduling
    "availability calendar",
    "booking calendar",
    "appointment calendar",
    "calendar invite booking",
    "appointment rescheduling",

    // Business website
    "small business website",
    "website builder for service business",
    "no monthly fee website builder",
    "one time payment website builder",

    // Portfolio
    "before and after gallery",
    "portfolio website for service business",
    "before and after slider",
    "service business portfolio",
    "customer testimonial website",
    "google review showcase",

    // Social
    "instagram booking page",
    "instagram bio link",
    "tiktok booking page",
    "social media booking link",

    // Cleaning
    "cleaning business website",
    "cleaning booking system",
    "cleaner schedule",
    "house cleaning booking system",

    // Hair / beauty
    "hair salon website",
    "hair salon booking",
    "hair salon appointment",
    "hair salon appointment book",
    "beauty salon website",

    // Nails
    "nail salon booking system",
    "nail salon schedule online",

    // Pet
    "pet grooming booking software",
    "pet grooming booking platform",
    "pet care booking system",

    // Automotive
    "car detailing booking system",
    "mobile car wash booking app",
    "car detailing website",

    // Home services
    "handyman website",
    "handyman booking system",
    "landscaping website",
    "home service booking system",
  ],

  alternates: {
    canonical: "https://simplebookme.com",
  },

  openGraph: {
    title:
      "Booking Website with Automatic Reminders & Review Requests | SimpleBookMe",

    description:
      "Accept bookings online, send appointment reminders automatically and request Google reviews after appointments. Build your service business website with no monthly fee.",

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
      {
        url: "/favicon_192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/favicon_180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Booking Website with Automatic Reminders | SimpleBookMe",

    description:
      "Create a booking website that confirms appointments, sends automatic reminders and asks customers for Google reviews. No monthly fee.",

    images: ["/images/og-home.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },

  other: {
    "google-site-verification":
      "_9XPHh7SY5Gvnydgm5jhkLwhbaswIr3RsACqQhq580A",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const host = (await headers()).get("host") || "";

  const cleanHost = host.split(":")[0];

  const isSubdomain =
    cleanHost.endsWith("simplebookme.com") &&
    cleanHost !== "simplebookme.com" &&
    cleanHost !== "www.simplebookme.com";

  return (
    <html lang="en">
      <head>
        {/* =====================================================
            GOOGLE ADS / GOOGLE TAG
            ===================================================== */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-17894933160"
        ></script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];

              function gtag(){
                dataLayer.push(arguments);
              }

              gtag('js', new Date());
              gtag('config', 'AW-17894933160');
            `,
          }}
        />

        {/* =====================================================
            SIMPLEBOOKME STRUCTURED DATA
            Only shown on the main SimpleBookMe domain.
            Customer subdomains can have their own SEO/schema.
            ===================================================== */}
        {!isSubdomain && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",

                name: "SimpleBookMe",

                applicationCategory: "BusinessApplication",

                applicationSubCategory:
                  "Appointment Scheduling Software",

                operatingSystem: "Web",

                url: "https://simplebookme.com",

                image:
                  "https://simplebookme.com/images/og-home.jpg",

                description:
                  "SimpleBookMe helps service businesses create a professional booking website, accept appointment requests, send booking confirmations and calendar invitations, automatically remind customers before appointments, and request Google reviews after appointments.",

                featureList: [
                  "Professional booking website",
				  "Free booking website",
                  "Online appointment booking",
                  "Custom business subdomain",
                  "Customer booking confirmation emails",
                  "Calendar invitation attachments",
                  "Automatic appointment reminder emails",
                  "Post-appointment review request emails",
                  "Google review link integration",
                  "Customer rescheduling links",
                  "Availability calendar",
                  "Service and pricing display",
                  "Portfolio gallery",
                  "Before and after portfolio slider",
                  "Video portfolio",
                  "Customer testimonials",
                  "Google Maps location",
                  "Business contact information",
                  "Social media links",
                  "Instagram bio booking link",
                  "Custom business logo",
                  "Mobile-friendly booking pages",
                ],


                creator: {
                  "@type": "Organization",

                  name: "SimpleBookMe",

                  url: "https://simplebookme.com",
                },

                provider: {
                  "@type": "Organization",

                  name: "SimpleBookMe",

                  url: "https://simplebookme.com",
                },
              }),
            }}
          />
        )}
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