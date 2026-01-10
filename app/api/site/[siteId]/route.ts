import { NextResponse } from "next/server";
import { getSupabase } from "@/app/lib/supabase";

/* ======================================================
   GET — Load site config (by siteId OR subdomain)
====================================================== */
export async function GET(
  _request: Request,
  context: { params: Promise<{ siteId: string }> }
) {
  const supabase = getSupabase();
  const { siteId } = await context.params;

  // 1️⃣ Try lookup by site_id
  let { data, error } = await supabase
    .from("sites")
    .select("data")
    .eq("site_id", siteId)
    .maybeSingle();

  // 2️⃣ Fallback: lookup by subdomain
  if (!data) {
    const res = await supabase
      .from("sites")
      .select("data")
      .eq("subdomain", siteId)
      .maybeSingle();

    data = res.data;
    error = res.error;
  }

  // 3️⃣ Not found
  if (error || !data) {
    return NextResponse.json(
      { error: "Site not found" },
      { status: 404 }
    );
  }

  // 4️⃣ Return stored config
  return NextResponse.json(data.data);
}

/* ======================================================
   PUT — Save site config (editor)
====================================================== */
export async function PUT(
  request: Request,
  context: { params: Promise<{ siteId: string }> }
) {
  const supabase = getSupabase();
  const { siteId } = await context.params;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // ✅ Expect { data: CustomerConfig }
  if (!body || typeof body !== "object" || !body.data) {
    return NextResponse.json(
      { error: "Missing data payload. Expected { data }" },
      { status: 400 }
    );
  }

  // 1️⃣ Try update by site_id
  let { error } = await supabase
    .from("sites")
    .update({ data: body.data })
    .eq("site_id", siteId);

  // 2️⃣ Fallback: update by subdomain
  if (error) {
    const res = await supabase
      .from("sites")
      .update({ data: body.data })
      .eq("subdomain", siteId);

    error = res.error;
  }

  // 3️⃣ Failed update
  if (error) {
    console.error("Save failed:", error);
    return NextResponse.json(
      { error: "Failed to save site" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
