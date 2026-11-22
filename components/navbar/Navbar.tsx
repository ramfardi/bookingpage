"use client";

import { useEffect, useState } from "react";
import SalesNavbar from "./SalesNavbar";
import ClientNavbar from "./ClientNavbar";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";

/*
 * The server (app/layout.tsx) decides the first mode from the host,
 * so the navbar is in the HTML that crawlers see. The browser lookup
 * still runs, to switch to client mode on /site/{id} preview pages.
 */
export default function Navbar({
  initialCustomer = null,
  isSubdomain = false,
}: {
  initialCustomer?: CustomerConfig | null;
  isSubdomain?: boolean;
}) {
  const [mode, setMode] = useState<"sales" | "client">(
    initialCustomer ? "client" : "sales"
  );
  // const [isPaid, setIsPaid] = useState<boolean | undefined>(undefined);

  const [isPaid, setIsPaid] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      const hostname = window.location.hostname;
      const result = await getCustomerConfigFromHost(hostname);

      if (result.mode === "client") {
        setMode("client");
        // const customer = result.config as CustomerConfig;
        // setIsPaid(customer.isPaid);
        setIsPaid(true);
      }
    }

    load();
  }, []);

  // 🔒 SINGLE DECISION POINT
  if (mode === "client") {
    return (
      <ClientNavbar isPaid={isPaid} initialCustomer={initialCustomer} />
    );
  }

  // Never show the SimpleBookMe menu on a customer subdomain.
  if (isSubdomain) {
    return null;
  }

  return <SalesNavbar />;
}
