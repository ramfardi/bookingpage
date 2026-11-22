import type { Metadata } from "next";

// Private page (editor, edit link or activation link): never index.
// Also sent as an X-Robots-Tag header from next.config.mjs.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
