import { NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

export async function GET(
  _request: Request,
  context: { params: Promise<{ siteId: string }> }
) {
  const supabase = getSupabase();

  // ✅ MUST await params in Next.js 15
  const { siteId } = await context.params;

  /* --------------------------------------------------
   * 1️⃣ Try lookup by site_id (UUID)
   * -------------------------------------------------- */
  let { data, error } = await supabase
    .from("sites")
    .select("data")
    .eq("site_id", siteId)
    .maybeSingle();

  /* --------------------------------------------------
   * 2️⃣ If not found, try lookup by subdomain
   * -------------------------------------------------- */
  if (!data) {
    const res = await supabase
      .from("sites")
      .select("data")
      .eq("subdomain", siteId)
      .maybeSingle();

    data = res.data;
    error = res.error;
  }

  /* --------------------------------------------------
   * 3️⃣ Not found
   * -------------------------------------------------- */
  if (error || !data) {
    return NextResponse.json(
      { error: "Site not found" },
      { status: 404 }
    );
  }

  /* --------------------------------------------------
   * 4️⃣ Return stored site config
   * -------------------------------------------------- */
  return NextResponse.json(data.data);
}
