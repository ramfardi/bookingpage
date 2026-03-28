import { createClient } from "@supabase/supabase-js";


export async function getSiteFromHost(host: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL1;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase env vars");
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const cleanHost = host.split(":")[0];
    const parts = cleanHost.split(".");

    // no subdomain
    if (parts.length < 3) return null;

    const subdomain = parts[0];

    if (!subdomain || subdomain === "www") return null;

    const { data, error } = await supabase
      .from("availability_sites")
      .select("*")
      .eq("subdomain", subdomain)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return null;
    }

    return data;

  } catch (err) {
    console.error("getSiteFromHost error:", err);
    return null;
  }
}