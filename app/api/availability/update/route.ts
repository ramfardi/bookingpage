import { NextResponse } from "next/server";
import { updateAvailability } from "../../../lib/availabilityStore";
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

    // ✅ keep memory update (so existing behavior still works)
    updateAvailability(body.siteId, body);

    // 🔥 update Supabase (persistent)
    const { error } = await supabase
      .from("availability_sites")
      .update({
        data: {
          businessName: body.businessName,
          selectedDays: body.selectedDays,
          dayTimes: body.dayTimes,
        },
      })
      .eq("site_id", body.siteId);

    if (error) {
      console.error("Supabase update error:", error);
      // ❗ don't break user flow
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Update availability error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}