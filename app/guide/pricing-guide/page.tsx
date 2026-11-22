import PricingGuidePage from "./GuidePageClient";
import { getHostCustomer } from "@/app/lib/getHostCustomer";

// Server wrapper: resolves sales vs client (customer subdomain) mode
// before rendering, so the HTML contains the full page for crawlers.
export default async function Page() {
  const customer = await getHostCustomer();

  return <PricingGuidePage initialCustomer={customer} />;
}
