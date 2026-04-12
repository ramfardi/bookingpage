import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ optional: if you create in-memory store like availability
// import { saveCleaningQuote } from "../../../lib/cleaningQuoteStore";

// ✅ Supabase client (server-side safe)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL1!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      siteId,
      editToken,
      businessName,

      // 🔥 quote-specific fields
      pricePerSqft,
      minimumPrice,
      houseTypes,
      extras
    } = body;

    if (!siteId || !editToken) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // ✅ (OPTIONAL) keep same pattern as availability
    // saveCleaningQuote({
    //   siteId,
    //   editToken,
    //   businessName,
    //   pricePerSqft,
    //   minimumPrice,
    //   houseTypes,
    //   extras
    // });

    // 🔥 generate clean subdomain (same logic)
    const subdomain = (businessName || "site")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20);

    // ✅ save to Supabase
    const { error } = await supabase
      .from("cleaning_quote_sites") // 🔥 NEW TABLE
      .insert({
        site_id: siteId,
        subdomain,
        edit_token: editToken,
        data: {
          businessName,
          pricePerSqft,
          minimumPrice,
          houseTypes, // { apartment: 1, townhouse: 1.1, ... }
          extras      // [{ name: "Deep Clean", price: 50 }]
        },
      });

    if (error) {
      console.error("Supabase error:", error);
      // ❗ do NOT break UX
    }

    return NextResponse.json({
      success: true,
      subdomain,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}