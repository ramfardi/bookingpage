import { NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

/* ---------------------------------------------
   GET: Load site config by siteId
--------------------------------------------- */
export async function GET(
  _req: Request,
  { params }: { params: { siteId: string } }
) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("sites")
    .select("data")
    .eq("site_id", params.siteId)
    .single();

  if (error || !data) {
    console.error("GET site error:", error);
    return new NextResponse("Site not found", { status: 404 });
  }

  return NextResponse.json(data.data);
}

/* ---------------------------------------------
   PUT: Save site config by siteId
--------------------------------------------- */
export async function PUT(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  const supabase = getSupabase();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  // ✅ Expect { data: CustomerConfig }
  if (!body || typeof body !== "object" || !body.data) {
    return new NextResponse(
      "Missing data payload. Expected { data: CustomerConfig }",
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("sites")
    .update({
      data: body.data,
    })
    .eq("site_id", params.siteId);

  if (error) {
    console.error("PUT site error:", error);
    return new NextResponse("Failed to save site", { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
