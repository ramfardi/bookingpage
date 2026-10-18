import { NextResponse } from "next/server";
import { saveAvailability } from "../../../lib/availabilityStore";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL1!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const {
      siteId,
      editToken,
      businessName = "",
      selectedDays,
      dayTimes,
    } = body;

    if (
      typeof siteId !== "string" ||
      !siteId.trim() ||
      typeof editToken !== "string" ||
      !editToken.trim()
    ) {
      return NextResponse.json(
        { error: "Missing site ID or edit token" },
        { status: 400 }
      );
    }

    if (
      typeof businessName !== "string" ||
      businessName.length > 100
    ) {
      return NextResponse.json(
        { error: "Business name must be 100 characters or fewer" },
        { status: 400 }
      );
    }

    const rawContact = body.contact ?? {};

    if (
      typeof rawContact !== "object" ||
      Array.isArray(rawContact)
    ) {
      return NextResponse.json(
        { error: "Invalid contact information" },
        { status: 400 }
      );
    }

    const email = rawContact.email ?? "";
    const phone = rawContact.phone ?? "";
    const address = rawContact.address ?? "";

    if (
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof address !== "string" ||
      email.length > 254 ||
      phone.length > 50 ||
      address.length > 500
    ) {
      return NextResponse.json(
        { error: "Invalid contact information or field length" },
        { status: 400 }
      );
    }

    const contact = {
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };

    if (
      contact.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const logoDataUrl = body.logoDataUrl ?? "";

    // Matches the resized image sent by the updated generator.
    // PNG is accepted because some browsers fall back to PNG
    // when canvas WebP encoding is unavailable.
    if (
      typeof logoDataUrl !== "string" ||
      logoDataUrl.length > 350_000 ||
      (logoDataUrl !== "" &&
        !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
          logoDataUrl
        ))
    ) {
      return NextResponse.json(
        { error: "Invalid logo. Please select a smaller JPG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    const availabilityData = {
      businessName: businessName.trim(),
      selectedDays,
      dayTimes,
      contact,
      logoDataUrl,
    };

    // Keep your existing in-memory system.
    const availabilityRecord = {
      siteId,
      editToken,
      ...availabilityData,
    };

    saveAvailability(availabilityRecord);

    // Preserve your existing subdomain format.
    // Fall back to "site" if sanitizing removes every character.
    const subdomain =
      availabilityData.businessName
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 20) || "site";

    const { error } = await supabase
      .from("availability_sites")
      .insert({
        site_id: siteId,
        subdomain,
        edit_token: editToken,
        data: availabilityData,
      });

    if (error) {
      console.error("Supabase availability save error:", error);
    }

    return NextResponse.json({
      success: true,
      subdomain,
      persisted: !error,
    });
  } catch (err) {
    console.error("Availability creation error:", err);

    return NextResponse.json(
      { error: "Could not create availability page" },
      { status: 500 }
    );
  }
}