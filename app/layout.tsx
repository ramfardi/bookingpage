import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import { Providers } from "./providers";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Create a Booking Website & Instagram Bio Link | No Monthly Fee | SimpleBookMe",
  description:
    "Create a professional booking website for your small business in minutes. Generate an Instagram bio link, accept bookings online, display services and pricing, and get your own website without monthly fees.",

  keywords: [
    "booking website builder",
    "create booking website",
    "online booking system",
    "scheduling website",
    "appointment booking website",
    "Instagram bio link for business",
    "create instagram bio link",
    "instagram booking link",
    "small business website",
    "website for service business",
    "booking website for hair salon",
    "booking website for cleaning business",
    "appointment scheduling website",
    "no monthly fee website builder",
    "one time payment website",
    "booking page for instagram",
    "simple booking website",
    "service business website",
  ],

  alternates: {
    canonical: "https://simplebookme.com",
  },

  openGraph: {
    title: "Create a Booking Website & Instagram Bio Link | SimpleBookMe",
    description:
      "Build a booking website for your service business and turn your Instagram bio into a booking page. Accept appointments, show services, and get a professional website with no monthly fee.",
    url: "https://simplebookme.com",
    siteName: "SimpleBookMe",
    type: "website",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      </body>
    </html>
  );
}
