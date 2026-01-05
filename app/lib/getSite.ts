import { supabaseServer } from "@/app/lib/supabase.server";
import type { CustomerConfig } from "./customerConfig";

export async function getSite(siteId: string) {
  const { data, error } = await supabaseServer
    .from("sites")
    .select("data")
    .eq("site_id", siteId)
    .single();

  if (error) return null;

  return data.data as CustomerConfig;
}
