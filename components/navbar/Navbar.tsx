"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "@/app/lib/getCustomer";
import SalesNavbar from "./SalesNavbar";
import ClientNavbar from "./ClientNavbar";

export default function Navbar() {
  const [mode, setMode] = useState<"sales" | "client" | null>(null);

  useEffect(() => {
    const { mode } = getCustomerConfigFromHost(window.location.hostname);
    setMode(mode);
  }, []);

  if (!mode) return null;

  return mode === "sales" ? <SalesNavbar /> : <ClientNavbar />;
}
