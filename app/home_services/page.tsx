import HomePage from "@/components/HomePage_homeservice";

export const metadata = {
  title: "Create a Home Services Booking Website | Online Appointments for Trades",
  description:
    "Create a professional booking website for your home services business. Let customers book handyman, plumbing, electrical, and repair services online with instant confirmation.",
  keywords: [
    "home services booking website",
    "handyman booking website",
    "plumber booking system",
    "electrician booking website",
    "home services appointment scheduling",
    "trade services website builder",
  ],
  openGraph: {
    title: "Home Services Booking Website | SimpleBookMe",
    description:
      "Launch a professional website for your home services business with online booking. No phone calls. Instant confirmation.",
    url: "https://simplebookme.com/home_services",
    siteName: "SimpleBookMe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create a Home Services Booking Website | SimpleBookMe",
    description:
      "Build a modern home services website with online booking for handyman, plumbing, and repair services.",
  },
  alternates: {
    canonical: "https://simplebookme.com/home_services",
  },
};


export default function Page() {
  return <HomePage />;
}
