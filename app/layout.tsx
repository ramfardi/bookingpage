import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import { Providers } from "./providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
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
