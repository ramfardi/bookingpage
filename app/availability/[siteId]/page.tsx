import "server-only";

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { getProductAccess } from "../../lib/billing/getAccess";

export const dynamic = "force-dynamic";

type AvailabilityPageData = {
  businessName?: string;
  selectedDays?: string[];
  dayTimes?: Record<string, { start?: string; end?: string }>;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  logoDataUrl?: string;
};

function InactiveAvailabilityPage({
  expired = false,
}: {
  expired?: boolean;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          {expired
            ? "This availability page is temporarily inactive"
            : "Availability page temporarily unavailable"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-gray-600">
          {expired
            ? "The free trial has ended. The business owner can reactivate this availability page using their private activation link."
            : "This availability page is not currently available. Please try again later or contact the business directly."}
        </p>
        <a
          href="https://simplebookme.com"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Visit SimpleBookMe
        </a>
      </div>
    </main>
  );
}

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  if (!siteId?.trim()) {
    notFound();
  }

  // Supabase is the authoritative store for pages across Vercel instances.
  // Never fetch the private edit_token on a public route.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL1;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables for Availability Page.");
    return <InactiveAvailabilityPage />;
  }

  let savedData: unknown = null;
  let found = false;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: record, error } = await supabase
      .from("availability_sites")
      .select("site_id, data")
      .eq("site_id", siteId)
      .maybeSingle();

    if (error) {
      console.error("Failed to load Availability Page:", error.code);
      return <InactiveAvailabilityPage />;
    }

    if (record) {
      found = true;
      savedData = record.data;
    }
  } catch {
    console.error("Unexpected error loading Availability Page.");
    return <InactiveAvailabilityPage />;
  }

  if (!found) {
    notFound();
  }

  if (
    !savedData ||
    typeof savedData !== "object" ||
    Array.isArray(savedData)
  ) {
    console.error("Availability Page has invalid saved data.");
    return <InactiveAvailabilityPage />;
  }

  const data = savedData as AvailabilityPageData;

  // Enforce the same billing rule used by Availability Page subdomains.
  try {
    const access = await getProductAccess({
      productKey: "availability",
      resourceId: siteId,
    });

    if (access.status === "unregistered") {
      // Grandfather only existing pages explicitly listed by their ID.
      // Do not allow all unregistered pages: registration can fail after save.
      const legacyIds = new Set(
        (process.env.AVAILABILITY_LEGACY_SITE_IDS || "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      );

      if (!legacyIds.has(siteId)) {
        return <InactiveAvailabilityPage />;
      }
    } else if (!access.allowed) {
      return (
        <InactiveAvailabilityPage expired={access.status === "expired"} />
      );
    }
  } catch {
    console.error("Unable to verify Availability Page billing status.");
    return <InactiveAvailabilityPage />;
  }

  const businessName = data.businessName || "Availability";
  const email = data.contact?.email?.trim() || "";
  const phone = data.contact?.phone?.trim() || "";
  const address = data.contact?.address?.trim() || "";
  const phoneHref = phone.replace(/[^\d+]/g, "");
  const hasContact = Boolean(email || phone || address);
  const selectedDays = Array.isArray(data.selectedDays)
    ? data.selectedDays.filter((day): day is string => typeof day === "string")
    : [];
  const dayTimes = data.dayTimes ?? {};

  // Only display supported image data URLs.
  const logo =
    data.logoDataUrl &&
    /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
      data.logoDataUrl
    )
      ? data.logoDataUrl
      : "";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-10 sm:px-6 flex justify-center">
      <div className="max-w-xl w-full space-y-6">
        {/* HEADER */}
        <header className="text-center space-y-3">
          {logo && (
            <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border bg-white p-3 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo}
                alt={`${businessName} logo`}
                width={112}
                height={112}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 break-words">
            {businessName}
          </h1>

          <p className="text-gray-500 text-sm">
            Weekly availability schedule
          </p>
        </header>

        {/* BUSINESS CONTACT */}
        {hasContact && (
          <section
            aria-label="Business contact information"
            className="rounded-2xl border bg-white p-6 shadow-sm space-y-5"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Contact us
            </h2>

            {(phone || email) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {phone && (
                  <a
                    href={`tel:${phoneHref}`}
                    className="flex min-w-0 flex-col items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-center text-white transition hover:bg-indigo-700"
                  >
                    <span className="font-semibold">Call</span>
                    <span className="mt-1 text-sm break-all">{phone}</span>
                  </a>
                )}

                {email && (
                  <a
                    href={`mailto:${encodeURIComponent(email)}`}
                    className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-center text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <span className="font-semibold">Email</span>
                    <span className="mt-1 text-sm break-all">{email}</span>
                  </a>
                )}
              </div>
            )}

            {address && (
              <div className={phone || email ? "border-t pt-4" : ""}>
                <p className="text-sm font-medium text-gray-900">
                  Address
                </p>

                <address className="mt-1 whitespace-pre-line break-words text-sm not-italic leading-6 text-gray-600">
                  {address}
                </address>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
                >
                  View on map
                </a>
              </div>
            )}
          </section>
        )}

        {/* AVAILABILITY */}
        <section
          aria-labelledby="availability-heading"
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border"
        >
          <h2
            id="availability-heading"
            className="mb-4 text-lg font-semibold text-gray-900"
          >
            Weekly hours
          </h2>

          <div className="space-y-3">
            {selectedDays.map((day) => {
              const isToday = day === today;
              const hours = dayTimes[day];

              return (
                <div
                  key={day}
                  className={`flex flex-wrap justify-between items-center gap-2 p-4 rounded-lg border ${
                    isToday
                      ? "bg-indigo-50 border-indigo-200"
                      : "bg-gray-50"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      isToday ? "text-indigo-700" : "text-gray-800"
                    }`}
                  >
                    {day}
                    {isToday && (
                      <span className="ml-2 text-xs text-indigo-500">
                        (Today)
                      </span>
                    )}
                  </span>

                  <span className="text-indigo-600 font-medium">
                    {hours?.start && hours?.end
                      ? `${hours.start} – ${hours.end}`
                      : "Hours not provided"}
                  </span>
                </div>
              );
            })}

            {selectedDays.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">
                No availability has been posted yet.
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t text-center space-y-3">
            {(phone || email) && (
              <p className="text-sm text-gray-500">
                Contact us using the details above to arrange an appointment.
              </p>
            )}

            <p className="text-xs text-gray-400">
              Powered by SimpleBookMe
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
