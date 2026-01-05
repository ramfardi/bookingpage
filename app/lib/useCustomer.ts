"use client";

import { useEffect, useState } from "react";
import { getCustomerConfigFromHost } from "./getCustomer";
import type { CustomerConfig } from "./customerConfig";
import type { LandingConfig } from "./landingConfig";

export function useCustomer() {
  const [customer, setCustomer] = useState<
    CustomerConfig | LandingConfig | null
  >(null);

  const [mode, setMode] = useState<"sales" | "client">("sales");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getCustomerConfigFromHost(
        window.location.hostname
      );

      setCustomer(result.config);
      setMode(result.mode);
      setLoading(false);
    }

    load();
  }, []);

  return { customer, mode, loading };
}
