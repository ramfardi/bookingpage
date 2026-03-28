import { NextResponse } from "next/server";
import { saveAvailability } from "../../../lib/availabilityStore";
import { createClient } from "@supabase/supabase-js";

// ✅ create Supabase client (server-side safe)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL1!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { siteId, editToken, businessName, selectedDays, dayTimes } = body;

    if (!siteId || !editToken) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // ✅ keep your existing in-memory system (DO NOT REMOVE)
    saveAvailability({
      siteId,
      editToken,
      businessName,
      selectedDays,
      dayTimes,
    });

    // 🔥 generate clean subdomain
    const subdomain = (businessName || "site")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20);

    // ✅ save to Supabase (non-blocking)
    const { error } = await supabase.from("availability_sites").insert({
      site_id: siteId,
      subdomain,
      edit_token: editToken,
      data: {
        businessName,
        selectedDays,
        dayTimes,
      },
    });

    if (error) {
      console.error("Supabase error:", error);
      // ❗ do NOT fail request — keep app working
    }

    return NextResponse.json({
      success: true,
      subdomain, // 🔥 important for next step
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}