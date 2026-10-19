import { NextResponse } from "next/server";
import { updateAvailability } from "../../../lib/availabilityStore";
import { createClient } from "@supabase/supabase-js";
import { normalizeBookingUrl } from "@/app/lib/bookingUrl";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL1!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      typeof body.siteId !== "string" ||
      !body.siteId
    ) {
      return NextResponse.json(
        { error: "Missing or invalid siteId" },
        { status: 400 }
      );
    }

    if (typeof body.editToken !== "string" || !body.editToken) {
      return NextResponse.json(
        { error: "Missing edit token" },
        { status: 401 }
      );
    }

    // Load the existing record and check authorization on the server.
    const { data: existing, error: loadError } = await supabase
      .from("availability_sites")
      .select("data")
      .eq("site_id", body.siteId)
      .eq("edit_token", body.editToken)
      .maybeSingle();

    if (loadError) {
      console.error("Availability load error:", loadError);

      return NextResponse.json(
        { error: "Could not load your availability page" },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: "Invalid edit link or availability page not found" },
        { status: 403 }
      );
    }

    const currentData = existing.data ?? {};

    if (
      body.contact !== undefined &&
      (!body.contact ||
        typeof body.contact !== "object" ||
        Array.isArray(body.contact))
    ) {
      return NextResponse.json(
        { error: "Invalid contact information" },
        { status: 400 }
      );
    }

    const contact = {
      ...(currentData.contact ?? {}),
    };

    for (const [field, limit] of [
      ["email", 254],
      ["phone", 50],
      ["address", 500],
    ] as const) {
      const value = body.contact?.[field];

      if (value !== undefined) {
        if (typeof value !== "string" || value.length > limit) {
          return NextResponse.json(
            { error: `Invalid ${field}` },
            { status: 400 }
          );
        }

        contact[field] = value.trim();
      }
    }

    if (
      contact.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (
      body.logoDataUrl !== undefined &&
      (typeof body.logoDataUrl !== "string" ||
        body.logoDataUrl.length > 350_000 ||
        (body.logoDataUrl !== "" &&
          !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
            body.logoDataUrl
          )))
    ) {
      return NextResponse.json(
        { error: "Invalid logo image" },
        { status: 400 }
      );
    }

	const bookingUrl = normalizeBookingUrl(
	  body.bookingUrl === undefined
		? currentData.bookingUrl ?? ""
		: body.bookingUrl
	);

	if (bookingUrl === null) {
	  return NextResponse.json(
		{ error: "Please enter a valid booking URL beginning with https:// or http://" },
		{ status: 400 }
	  );
	}

    // Preserve all existing saved fields.
    // Omitted logo = keep it; empty string = explicitly remove it.
    const updatedData = {
      ...currentData,
      businessName:
        body.businessName ?? currentData.businessName,
      selectedDays:
        body.selectedDays ?? currentData.selectedDays,
      dayTimes:
        body.dayTimes ?? currentData.dayTimes,
      contact,
      logoDataUrl:
        body.logoDataUrl === undefined
          ? currentData.logoDataUrl ?? ""
          : body.logoDataUrl,
	  bookingUrl,
    };

    // Persist first so a failed database save isn't reported as success.
    const { data: saved, error: saveError } = await supabase
      .from("availability_sites")
      .update({ data: updatedData })
      .eq("site_id", body.siteId)
      .eq("edit_token", body.editToken)
      .select("site_id")
      .maybeSingle();

    if (saveError || !saved) {
      console.error("Availability save error:", saveError);

      return NextResponse.json(
        { error: "Could not save changes. Please try again." },
        { status: 500 }
      );
    }

    // Keep your in-memory store synchronized.
    updateAvailability(body.siteId, {
      ...updatedData,
      siteId: body.siteId,
      editToken: body.editToken,
    });

    return NextResponse.json({
      success: true,
      persisted: true,
    });
  } catch (err) {
    console.error("Update availability error:", err);

    return NextResponse.json(
      { error: "Could not update availability" },
      { status: 500 }
    );
  }
}