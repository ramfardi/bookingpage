import HomePage from "@/components/HomePage_cleaning";

export const metadata = {
  title: "Cleaning Service Booking Website | Online Appointments for Cleaners",
  description:
    "Create a professional booking website for your cleaning business. Let customers book residential or commercial cleaning services online with instant confirmation.",
  keywords: [
    "cleaning service booking website",
    "cleaning appointment booking system",
    "online booking for cleaners",
    "cleaning business booking software",
    "cleaning scheduling website",
  ],
  openGraph: {
    title: "Cleaning Service Booking Website | SimpleBookMe",
    description:
      "Let customers book your cleaning services online in minutes. No phone calls. Instant confirmation.",
    url: "https://simplebookme.com/cleaning",
    siteName: "SimpleBookMe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cleaning Service Booking Website | SimpleBookMe",
    description:
      "Create a professional booking website for your cleaning business and accept online bookings instantly.",
  },
};

export default function Page() {
  return <HomePage />;
}
