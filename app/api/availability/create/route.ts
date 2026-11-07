
import { NextResponse } from "next/server";
import { saveAvailability } from "../../../lib/availabilityStore";
import { createClient } from "@supabase/supabase-js";
import { normalizeBookingUrl } from "@/app/lib/bookingUrl";

// Shared billing system
import { registerProduct } from "@/app/lib/billing/registerProduct";
import { sendProductLinks } from "@/app/lib/billing/sendLinks";
import { getBillingDb } from "@/app/lib/billing/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL1!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const noCacheHeaders = {
  "Cache-Control": "private, no-store",
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: noCacheHeaders,
  });
}

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid weekdays for the Availability Page calendar.
const VALID_DAYS = new Set([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/* ---------------- CREATE AVAILABILITY PAGE ---------------- */

export async function POST(req: Request) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return json(
        { error: "Invalid JSON request." },
        400
      );
    }

    if (!isRecord(body)) {
      return json(
        { error: "Invalid request." },
        400
      );
    }

    const {
      siteId,
      editToken,
      businessName = "",
      selectedDays,
      dayTimes,
    } = body;

    /* ---------------- VALIDATE IDENTIFIERS ---------------- */

    if (
      typeof siteId !== "string" ||
      !siteId.trim() ||
      typeof editToken !== "string" ||
      !editToken.trim()
    ) {
      return json(
        { error: "Missing site ID or edit token." },
        400
      );
    }

    const cleanSiteId = siteId.trim();
    const cleanEditToken = editToken.trim();

    /* ---------------- BUSINESS NAME ---------------- */

    if (
      typeof businessName !== "string" ||
      businessName.length > 100
    ) {
      return json(
        {
          error:
            "Business name must be 100 characters or fewer.",
        },
        400
      );
    }

    /* ---------------- CONTACT INFORMATION ---------------- */

    const rawContact = body.contact ?? {};

    if (!isRecord(rawContact)) {
      return json(
        { error: "Invalid contact information." },
        400
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
      return json(
        {
          error:
            "Invalid contact information or field length.",
        },
        400
      );
    }

    const contact = {
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
    };

    // NEW: Email is mandatory for the trial and
    // delivery of public, private and activation links.
    if (!EMAIL_PATTERN.test(contact.email)) {
      return json(
        {
          error:
            "Please enter a valid email address to receive your availability page links.",
        },
        400
      );
    }

    /* ---------------- LOGO ---------------- */

    const logoDataUrl = body.logoDataUrl ?? "";

    // Preserve the existing embedded-logo format.
    if (
      typeof logoDataUrl !== "string" ||
      logoDataUrl.length > 350_000 ||
      (logoDataUrl !== "" &&
        !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
          logoDataUrl
        ))
    ) {
      return json(
        {
          error:
            "Invalid logo. Please select a smaller JPG, PNG, or WebP image.",
        },
        400
      );
    }

    /* ---------------- BOOKING LINK ---------------- */

    let bookingUrl: string | null;

    try {
      bookingUrl = normalizeBookingUrl(
        body.bookingUrl ?? ""
      );
    } catch {
      return json(
        {
          error:
            "Please enter a valid booking URL.",
        },
        400
      );
    }

    if (bookingUrl === null) {
      return json(
        {
          error:
            "Please enter a valid booking URL beginning with https:// or http://",
        },
        400
      );
    }

    /* ---------------- VALIDATE WEEKLY SCHEDULE ---------------- */

    // JSON fields are unknown until they have been validated.
    // saveAvailability expects string[] and a typed dayTimes object.
    if (
      !Array.isArray(selectedDays) ||
      selectedDays.length === 0 ||
      selectedDays.length > 7
    ) {
      return json(
        { error: "Select at least one available day." },
        400
      );
    }

    const validatedDays: string[] = [];

    for (const day of selectedDays) {
      if (
        typeof day !== "string" ||
        !VALID_DAYS.has(day) ||
        validatedDays.includes(day)
      ) {
        return json(
          { error: "Invalid or duplicate availability day." },
          400
        );
      }
      validatedDays.push(day);
    }

    if (!isRecord(dayTimes)) {
      return json(
        { error: "Invalid working hours." },
        400
      );
    }

    const validatedDayTimes: Record<
      string,
      { start: string; end: string }
    > = {};

    for (const [day, rawTimes] of Object.entries(dayTimes)) {
      if (!VALID_DAYS.has(day)) continue;

      if (
        !isRecord(rawTimes) ||
        typeof rawTimes.start !== "string" ||
        typeof rawTimes.end !== "string" ||
        !TIME_PATTERN.test(rawTimes.start) ||
        !TIME_PATTERN.test(rawTimes.end)
      ) {
        return json(
          { error: `Invalid working hours for ${day}.` },
          400
        );
      }

      validatedDayTimes[day] = {
        start: rawTimes.start,
        end: rawTimes.end,
      };
    }

    for (const day of validatedDays) {
      const hours = validatedDayTimes[day];
      if (!hours || hours.start >= hours.end) {
        return json(
          { error: `Choose valid start and end times for ${day}.` },
          400
        );
      }
    }

    /* ---------------- AVAILABILITY DATA ---------------- */

    // Preserve the data shape used by the public page and editor.
    const availabilityData = {
      businessName: businessName.trim(),
      selectedDays: validatedDays,
      dayTimes: validatedDayTimes,
      contact,
      logoDataUrl,
      bookingUrl,
    };

    /* ---------------- SUBDOMAIN ---------------- */

    // Preserve the original subdomain format.
    const subdomain =
      availabilityData.businessName
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 20) || "site";

    /* ---------------- STEP 1: SAVE TO SUPABASE ---------------- */

    // Check whether a previous attempt already saved
    // this page. This allows retries after a temporary
    // billing-registration failure.
    const {
      data: existingPage,
      error: lookupError,
    } = await supabase
      .from("availability_sites")
      .select("site_id, subdomain, edit_token")
      .eq("site_id", cleanSiteId)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "Availability page lookup failed."
      );

      return json(
        {
          error:
            "Could not verify your availability page. Please try again.",
        },
        503
      );
    }

    if (existingPage) {
      // Never recover somebody else's page based on
      // a matching site ID alone.
      if (
        existingPage.edit_token !== cleanEditToken ||
        existingPage.subdomain !== subdomain
      ) {
        return json(
          {
            error:
              "This availability page ID is already in use.",
          },
          409
        );
      }

      // Same page ID, edit token and subdomain:
      // continue billing setup without inserting
      // another page.
    } else {
      const { error: insertError } = await supabase
        .from("availability_sites")
        .insert({
          site_id: cleanSiteId,
          subdomain,
          edit_token: cleanEditToken,
          data: availabilityData,
        });

      if (insertError) {
        console.error(
          "Supabase availability save failed:",
          insertError.code
        );

        if (insertError.code === "23505") {
          return json(
            {
              error:
                "This page ID or business subdomain is already taken. Please choose a different business name and try again.",
            },
            409
          );
        }

        return json(
          {
            error:
              "Could not save your availability page. Please try again.",
          },
          503
        );
      }
    }

    /* ---------------- STEP 2: REGISTER FREE TRIAL ---------------- */

    let billing: Awaited<
      ReturnType<typeof registerProduct>
    >;

    try {
      billing = await registerProduct({
        productKey: "availability",
        resourceId: cleanSiteId,
        email: contact.email,
      });
    } catch {
      console.error(
        "Availability page saved, but billing registration failed."
      );

      // A retry with the same site ID and edit token
      // can recover the existing page.
      return json(
        {
          error:
            "Your availability page was saved, but trial setup could not be completed. Please retry using the same page details.",
          retryable: true,
        },
        503
      );
    }

    /* ---------------- STEP 3: KEEP IN-MEMORY STORAGE ---------------- */

    // Preserve compatibility with the existing
    // availability store.
    const availabilityRecord = {
      siteId: cleanSiteId,
      editToken: cleanEditToken,
      ...availabilityData,
    };

    saveAvailability(availabilityRecord);

    /* ---------------- STEP 4: GENERATE LINKS ---------------- */

    const appOrigin =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      new URL(req.url).origin;

    const publicUrl =
      `https://${subdomain}.simplebookme.com`;

    const editUrl = new URL(
      `/availability/${encodeURIComponent(cleanSiteId)}/edit`,
      appOrigin
    );

    editUrl.searchParams.set(
      "token",
      cleanEditToken
    );

    const privateUrl = editUrl.toString();

    const activationUrl = billing.activationUrl;

    /* ---------------- STEP 5: SEND WELCOME EMAIL ---------------- */

    let emailSent = false;
    let emailWarning = "";

    try {
      const db = getBillingDb();

      const {
        data: activationRow,
        error: activationError,
      } = await db
        .from("product_activations")
        .select("id, welcome_email_sent_at")
        .eq("product_key", "availability")
        .eq("resource_id", cleanSiteId)
        .maybeSingle();

      if (activationError || !activationRow) {
        throw new Error(
          "Unable to verify welcome email status."
        );
      }

      if (activationRow.welcome_email_sent_at) {
        // The welcome email was accepted previously.
        emailSent = true;
      } else {
        await sendProductLinks({
          productKey: "availability",
          email: contact.email,
          businessName:
            availabilityData.businessName ||
            "Your Business",
          publicUrl,
          privateUrl,
          activationUrl,
          trialEndsAt: billing.trialEndsAt,
        });

        emailSent = true;

        // Record that the email was accepted.
        const { error: updateError } = await db
          .from("product_activations")
          .update({
            welcome_email_sent_at:
              new Date().toISOString(),
          })
          .eq("id", activationRow.id)
          .is("welcome_email_sent_at", null);

        if (updateError) {
          console.error(
            "Availability welcome email sent, but status update failed."
          );
        }
      }
    } catch {
      console.error(
        "Availability page created, but welcome email failed."
      );

      emailWarning =
        "Your availability page was created, but the email could not be sent. Please save your public, private, and activation links.";
    }

    /* ---------------- STEP 6: SUCCESS RESPONSE ---------------- */

    return json({
      success: true,
      persisted: true,

      // Existing response fields
      subdomain,

      // Additional identifying information
      siteId: cleanSiteId,

      // NEW: Page links
      publicUrl,
      editUrl: privateUrl,
      activationUrl,

      // NEW: 14-day trial
      trialStartedAt: billing.trialStartedAt,
      trialEndsAt: billing.trialEndsAt,

      // NEW: Email delivery result
      emailSent,
      emailWarning,
    });
  } catch (err) {
    // Avoid logging private edit tokens or request bodies.
    console.error(
      "Unexpected availability creation error."
    );

    return json(
      {
        error:
          "Could not create availability page. Please try again.",
      },
      500
    );
  }
}
