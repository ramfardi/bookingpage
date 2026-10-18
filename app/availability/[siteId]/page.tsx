import { getAvailability } from "../../lib/availabilityStore";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const data = getAvailability(siteId);

  if (!data) {
    return <div className="p-10 text-center">Not found</div>;
  }

  const businessName = data.businessName || "Availability";
  const email = data.contact?.email?.trim() || "";
  const phone = data.contact?.phone?.trim() || "";
  const address = data.contact?.address?.trim() || "";

  const phoneHref = phone.replace(/[^\d+]/g, "");
  const hasContact = Boolean(email || phone || address);

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
                    <span className="mt-1 text-sm break-all">
                      {phone}
                    </span>
                  </a>
                )}

                {email && (
                  <a
                    href={`mailto:${encodeURIComponent(email)}`}
                    className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-center text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <span className="font-semibold">Email</span>
                    <span className="mt-1 text-sm break-all">
                      {email}
                    </span>
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
            {data.selectedDays.map((day: string) => {
              const isToday = day === today;
              const hours = data.dayTimes[day];

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

            {data.selectedDays.length === 0 && (
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