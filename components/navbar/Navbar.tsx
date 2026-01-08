"use client";

import { useEffect, useState } from "react";
import SalesNavbar from "./SalesNavbar";
import ClientNavbar from "./ClientNavbar";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import type { CustomerConfig } from "@/app/lib/customerConfig";

export default function Navbar() {
  const [mode, setMode] = useState<"sales" | "client">("sales");
  const [isPaid, setIsPaid] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const hostname = window.location.hostname;
      const result = await getCustomerConfigFromHost(hostname);

      setMode(result.mode);

      if (result.mode === "client") {
        const customer = result.config as CustomerConfig;
        setIsPaid(customer.isPaid);
      }
    }

    load();
  }, []);

  // 🔒 SINGLE DECISION POINT
  if (mode === "client") {
    return <ClientNavbar isPaid={isPaid} />;
  }

  return <SalesNavbar />;
}
