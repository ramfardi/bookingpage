import { NextResponse } from "next/server";
import {
  getPricingForEdit,
  PricingStoreError,
} from "@/app/lib/pricingStore";

export const runtime = "nodejs";
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

    const siteId = searchParams.get("siteId")?.trim() || "";
    const token = searchParams.get("token")?.trim() || "";

    if (!siteId) {
      return json({ error: "Missing siteId." }, 400);
    }

    if (!token) {
      return json({ error: "Missing edit token." }, 401);
    }

    // The store checks both siteId and edit token in Supabase.
    // No saved information is returned without authorization.
    const saved = await getPricingForEdit(siteId, token);

    if (!saved) {
      return json(
        {
          error:
            "This edit link is invalid or the pricing page no longer exists.",
        },
        404
      );
    }

    // Return pricing data directly, matching the edit page.
    // Never return the private edit token.
    return json({
      siteId,
      businessName: saved.businessName ?? "",
      templateId: saved.templateId ?? "custom",
      currency: saved.currency ?? "CAD",

      pricing: {
        title: saved.pricing?.title ?? "Services & Pricing",
        rows: (saved.pricing?.rows ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          price: row.price,
        })),
      },

      contact: {
        email: saved.contact?.email ?? "",
        phone: saved.contact?.phone ?? "",
        address: saved.contact?.address ?? "",
      },

      // Preserve both supported logo formats.
      logoUrl: saved.logoUrl ?? "",
      logoDataUrl: saved.logoDataUrl ?? "",

      bookingUrl: saved.bookingUrl ?? "",
      notes: saved.notes ?? "",
    });
  } catch (error) {
    if (error instanceof PricingStoreError) {
      return json(
        { error: error.message },
        error.status
      );
    }

    // Avoid logging private tokens or request URLs.
    console.error("Unexpected pricing page load failure.");

    return json(
      {
        error:
          "Could not load your pricing page. Please try again.",
      },
      500
    );
  }
}