import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET(
  _request: Request,
  context: { params: Promise<{ siteId: string }> }
) {
  // ✅ MUST await params in Next.js 15
  const { siteId } = await context.params;

  const { data, error } = await supabase
    .from("sites")
    .select("data")
    .eq("site_id", siteId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Site not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data.data);
}
