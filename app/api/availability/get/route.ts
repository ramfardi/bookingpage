import { NextResponse } from "next/server";
import { getAvailability } from "../../../lib/availabilityStore";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL1!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "private, no-store",
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: noCacheHeaders,
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get("siteId");
    const token = searchParams.get("token");

    if (!siteId) {
      return json({ error: "Missing siteId" }, 400);
    }

    if (!token) {
      return json({ error: "Missing edit token" }, 401);
    }

    // Supabase is the authoritative source.
    const { data: dbData, error } = await supabase
      .from("availability_sites")
      .select("site_id, edit_token, data")
      .eq("site_id", siteId)
      .maybeSingle();

    if (error) {
      console.error("GET availability database error:", error);

      return json(
        { error: "Could not load availability. Please try again." },
        503
      );
    }

    if (dbData) {
      if (dbData.edit_token !== token) {
        return json({ error: "Invalid edit link" }, 403);
      }

      const saved = dbData.data ?? {};

      return json({
        siteId: dbData.site_id,
        businessName: saved.businessName ?? "",
        selectedDays: saved.selectedDays ?? [],
        dayTimes: saved.dayTimes ?? {},
        contact: {
          email: saved.contact?.email ?? "",
          phone: saved.contact?.phone ?? "",
          address: saved.contact?.address ?? "",
        },
        logoDataUrl: saved.logoDataUrl ?? "",
      });
    }

    // Preserve support for records that exist only in memory.
    const memoryData = getAvailability(siteId);

    if (!memoryData) {
      return json({ error: "Availability not found" }, 404);
    }

    if (memoryData.editToken !== token) {
      return json({ error: "Invalid edit link" }, 403);
    }

    return json({
      siteId: memoryData.siteId,
      businessName: memoryData.businessName ?? "",
      selectedDays: memoryData.selectedDays ?? [],
      dayTimes: memoryData.dayTimes ?? {},
      contact: {
        email: memoryData.contact?.email ?? "",
        phone: memoryData.contact?.phone ?? "",
        address: memoryData.contact?.address ?? "",
      },
      logoDataUrl: memoryData.logoDataUrl ?? "",
    });
  } catch (err) {
    console.error("GET availability error:", err);

    return json({ error: "Could not load availability" }, 500);
  }
}