import HomePage from "@/components/HomePage_beauty";

export const metadata = {
  title: "Create a Beauty Services Booking Website | Online Appointments Made Easy",
  description:
    "Create a professional beauty services website with online booking. Let clients book nail salon, massage, spa, and beauty treatments online with instant confirmation.",
  keywords: [
    "beauty services booking website",
    "nail salon booking website",
    "massage booking system",
    "spa booking website",
    "beauty appointment scheduling",
    "beauty business website builder",
  ],
  openGraph: {
    title: "Beauty Services Booking Website | SimpleBookMe",
    description:
      "Launch a professional beauty services website with online booking for salons, spas, and wellness businesses.",
    url: "https://simplebookme.com/beauty",
    siteName: "SimpleBookMe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create a Beauty Services Booking Website | SimpleBookMe",
    description:
      "Build a modern beauty services website with online booking for nail salons, massage therapists, and spas.",
  },
  alternates: {
    canonical: "https://simplebookme.com/beauty",
  },
};


export default function Page() {
  return <HomePage />;
}
