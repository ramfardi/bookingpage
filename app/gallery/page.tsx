import type { Metadata } from "next";
import GalleryPage from "./GalleryPageClient";
import { getHostCustomer } from "@/app/lib/getHostCustomer";
import {
  customerPageMetadata,
  CUSTOMER_ONLY_FALLBACK,
} from "@/app/lib/customerMetadata";

// Customer's own title/description/canonical on {sub}.simplebookme.com;
// noindex elsewhere (the page is blank on simplebookme.com).
export async function generateMetadata(): Promise<Metadata> {
  return customerPageMetadata("gallery", CUSTOMER_ONLY_FALLBACK);
}

// Server wrapper: resolves the customer before rendering, so the
// HTML contains the full page for crawlers.
export default async function Page() {
  const customer = await getHostCustomer();

  return <GalleryPage initialCustomer={customer} />;
}
