
import "server-only";

import { createClient } from "@supabase/supabase-js";

export function getBillingDb() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL1;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase configuration for billing."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
