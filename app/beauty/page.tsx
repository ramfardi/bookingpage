import HomePage from "@/components/HomePage_beauty";

export const metadata = {
  title: "Beauty Salon Website with Online Booking | SimpleBookMe",
  description:
    "Create a professional beauty salon website with online booking and appointments. Perfect for nail salons, spas, massage therapists, and beauty professionals.",
  keywords: [
    "beauty salon website",
    "beauty booking website",
    "nail salon website",
    "spa booking website",
    "massage therapist website",
    "online booking for beauty business",
    "beauty appointment scheduling",
  ],
  openGraph: {
    title: "Beauty Salon Website with Online Booking | SimpleBookMe",
    description:
      "Launch a professional beauty salon website with online booking, appointments, and payments. Built for salons, spas, and beauty professionals.",
    url: "https://simplebookme.com/beauty",
    siteName: "SimpleBookMe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beauty Salon Website with Online Booking | SimpleBookMe",
    description:
      "Build a modern beauty salon website with online booking and appointments for nail salons, spas, and massage therapists.",
  },
  alternates: {
    canonical: "https://simplebookme.com/beauty",
  },
};



export default function Page() {
  return <HomePage />;
}
