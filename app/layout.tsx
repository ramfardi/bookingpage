import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
