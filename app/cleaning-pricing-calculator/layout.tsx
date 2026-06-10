import type { Metadata } from "next";

export const metadata: Metadata = {
title:
"Free Cleaning Service Price Calculator | House Cleaning & Deep Cleaning Rates",

description:
"Calculate how much to charge for house cleaning, deep cleaning, move-out cleaning, and Airbnb cleaning services. Estimate labor costs, supplies, overhead expenses, and profit margins with this free cleaning pricing calculator.",

keywords: [
"cleaning service price calculator",
"cleaning pricing calculator",
"house cleaning rates calculator",
"how much should i charge for cleaning",
"cleaning estimate calculator",
"house cleaning estimate",
"residential cleaning pricing",
"cleaning service pricing",
"cleaning quote calculator",
"deep cleaning pricing",
"move out cleaning rates",
"airbnb cleaning pricing",
"maid service pricing",
"cleaning business pricing tool",
"price cleaning jobs",
"cleaning cost estimator",
],

alternates: {
canonical:
"https://simplebookme.com/cleaning-pricing-calculator",
},

openGraph: {
title:
"Free Cleaning Service Price Calculator",
description:
"Estimate profitable cleaning service prices based on labor, supplies, overhead costs, and profit margin.",
url:
"https://simplebookme.com/cleaning-pricing-calculator",
siteName: "SimpleBookMe",
images: [
{
url:
"https://simplebookme.com/og-cleaning-pricing.jpg",
width: 1200,
height: 630,
alt:
"Cleaning Service Price Calculator",
},
],
type: "website",
},

twitter: {
card: "summary_large_image",
title:
"Free Cleaning Service Price Calculator",
description:
"Calculate cleaning service prices in seconds.",
images: [
"https://simplebookme.com/og-cleaning-pricing.jpg",
],
},

robots: {
index: true,
follow: true,
},
};


export default function CleaningPricingCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}