import './globals.css';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
