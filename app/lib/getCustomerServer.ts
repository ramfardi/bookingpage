import { createClient } from "@supabase/supabase-js";
import type { CustomerConfig } from "./customerConfig";

export async function getCustomerServer(
  host: string
): Promise<CustomerConfig | null> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL1;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey
  );

  const cleanHost = host
    .replace(":3000", "")
    .replace("www.", "");

  const parts = cleanHost.split(".");

  if (parts.length < 3) {
    return null;
  }

  const subdomain = parts[0];

  const { data } = await supabase
    .from("sites")
    .select("*")
    .eq("subdomain", subdomain)
    .single();

  if (!data) {
    return null;
  }

  return data.data as CustomerConfig;
}