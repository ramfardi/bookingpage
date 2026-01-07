"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SalesNavbar from "./SalesNavbar";
import ClientNavbar from "./ClientNavbar";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";

export default function Navbar() {
  const pathname = usePathname();

  // Client pages are always under /site/[siteId]
  const isClientSite = pathname.startsWith("/site/");

  // Preview sites start unpaid
  const [isPaid, setIsPaid] = useState<boolean>(true);

  useEffect(() => {
    if (!isClientSite) return;

    async function load() {
      const hostname = window.location.hostname;
      const result = await getCustomerConfigFromHost(hostname);

      // ✅ Only trust CLIENT config
      if (result.mode === "client") {
        const customer = result.config as CustomerConfig;

        // ✅ Only update if explicitly defined
        if (typeof customer.isPaid === "boolean") {
          setIsPaid(customer.isPaid);
        }
      }
    }

    load();
  }, [isClientSite]);

  if (!isClientSite) {
    return <SalesNavbar />;
  }

  return <ClientNavbar isPaid={isPaid} />;
}
