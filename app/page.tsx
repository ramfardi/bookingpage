import HomePage from "@/components/HomePage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SimpleBookMe | Create a Booking Website in Minutes",
  description:
    "SimpleBookMe helps service businesses create a professional booking website with online appointments and instant confirmations.",

  alternates: {
    canonical: "https://simplebookme.com/",
  },

  robots: {
    index: true,
    follow: true,
  },
};


export default function Page() {
  return <HomePage />;
}
