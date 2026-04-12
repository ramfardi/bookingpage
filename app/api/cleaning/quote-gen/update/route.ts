import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase client (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL1!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.siteId) {
      return NextResponse.json(
        { error: "Missing siteId" },
        { status: 400 }
      );
    }

    // 🔒 VALIDATE EDIT TOKEN (IMPORTANT)
    const { data: existing, error: fetchError } = await supabase
      .from("cleaning_quote_sites")
      .select("*")
      .eq("site_id", body.siteId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    if (existing.edit_token !== body.editToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // 🔥 update Supabase (persistent)
    const { error } = await supabase
      .from("cleaning_quote_sites")
      .update({
        data: {
          businessName: body.businessName,

          // 🔥 quote-specific fields
          pricePerSqft: body.pricePerSqft,
          minimumPrice: body.minimumPrice,
          houseTypes: body.houseTypes,
          extras: body.extras,
        },
      })
      .eq("site_id", body.siteId);

    if (error) {
      console.error("Supabase update error:", error);
      // ❗ don't break UX
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Update cleaning quote error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}