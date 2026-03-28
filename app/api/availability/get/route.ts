import { NextResponse } from "next/server";
import { getAvailability } from "../../../lib/availabilityStore";
import { createClient } from "@supabase/supabase-js";

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
      .from("availability_sites")
      .select("*")
      .eq("site_id", siteId)
      .single();

    if (dbData && !error) {
      return NextResponse.json({
        siteId: dbData.site_id,
        editToken: dbData.edit_token,
        ...dbData.data, // businessName, selectedDays, dayTimes
      });
    }

    // 🔁 2. Fallback to in-memory (so existing flow still works)
    const memoryData = getAvailability(siteId);

    if (!memoryData) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(memoryData);

  } catch (err) {
    console.error("GET availability error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}