import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ optional: if you create in-memory store like availability
// import { getCleaningQuote } from "../../../lib/cleaningQuoteStore";

// ✅ Supabase client (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL1!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json(
        { error: "Missing siteId" },
        { status: 400 }
      );
    }

    // 🔥 1. Try Supabase FIRST
    const { data: dbData, error } = await supabase
      .from("cleaning_quote_sites") // 🔥 NEW TABLE
      .select("*")
      .eq("site_id", siteId)
      .single();

    if (dbData && !error) {
      return NextResponse.json({
        siteId: dbData.site_id,
        editToken: dbData.edit_token,

        // 🔥 quote-specific data
        ...dbData.data, 
        // businessName, pricePerSqft, minimumPrice, houseTypes, extras
      });
    }

    // 🔁 2. Fallback to in-memory (optional, same pattern)
    // const memoryData = getCleaningQuote(siteId);

    // if (!memoryData) {
    //   return NextResponse.json(
    //     { error: "Not found" },
    //     { status: 404 }
    //   );
    // }

    // return NextResponse.json(memoryData);

    // ❗ If you don't use memory fallback:
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );

  } catch (err) {
    console.error("GET cleaning quote error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}