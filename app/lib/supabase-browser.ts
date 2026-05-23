import { createClient } from "@supabase/supabase-js";

export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL1!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);