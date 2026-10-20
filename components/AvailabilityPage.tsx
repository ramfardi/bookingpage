import { normalizeBookingUrl } from "@/app/lib/bookingUrl";
import {
  DAYS,
  HOURS,
  getAvailableHours,
  hourLabel,
} from "@/app/lib/availabilitySlots";
import type { SlotOverrides } from "@/app/lib/availabilitySlots";

type Props = {
  data: {
    businessName?: string;
    selectedDays?: string[];
    dayTimes?: Record<string, { start: string; end: string }>;
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    logoDataUrl?: string;
    bookingUrl?: string;
    slotOverrides?: SlotOverrides;
  };
};

export default function AvailabilityPage({ data }: Props) {
  const businessName = data.businessName?.trim() || "Availability";

  const email = data.contact?.email?.trim() || "";
  const phone = data.contact?.phone?.trim() || "";
  const address = data.contact?.address?.trim() || "";
  const phoneHref = phone.replace(/[^\d+]/g, "");

  const bookingUrl =
    normalizeBookingUrl(data.bookingUrl ?? "") || "";

  const logo =
    data.logoDataUrl &&
    /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
      data.logoDataUrl
    )
      ? data.logoDataUrl
      : "";

  const initials = businessName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  // Uses the same logic as the editor, including saved block overrides.
  const availableHoursByDay = getAvailableHours(data);

  const activeDays = availableHoursByDay.filter(
    (dayHours) => dayHours.length > 0
  ).length;

  const totalSlots = availableHoursByDay.reduce(
    (total, dayHours) => total + dayHours.length,
    0
  );

  const hasContact = Boolean(email || phone || address);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* BUSINESS HEADER */}
        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-400" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {logo ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logo}
                        alt={`${businessName} logo`}
                        width={80}
                        height={80}
                        className="h-full w-full object-contain p-2"
                      />
                    </>
                  ) : (
                    <span className="text-2xl font-semibold tracking-tight text-indigo-600">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
                    Weekly availability
                  </p>

                  <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                    {businessName}
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Find a time that works for you.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {activeDays} {activeDays === 1 ? "day" : "days"} a week
                </span>

                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  {totalSlots}h available
                </span>
              </div>
            </div>

            {hasContact && (
              <div className="mt-6 flex flex-col gap-5 border-t border-slate-100 pt-6 lg:flex-row lg:items-center lg:justify-between">
                {(phone || email) && (
                  <div className="flex flex-wrap gap-3">
                    {phone && (
                      <a
                        href={`tel:${phoneHref}`}
                        className="inline-flex flex-col rounded-xl bg-indigo-600 px-5 py-3 text-white transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        <span className="text-sm font-semibold">
                          Call to book
                        </span>

                        <span className="mt-0.5 break-all text-xs text-indigo-100">
                          {phone}
                        </span>
                      </a>
                    )}

                    {email && (
                      <a
                        href={`mailto:${encodeURIComponent(email)}`}
                        className="inline-flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white px-5 py-3 transition hover:border-indigo-200 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        <span className="text-sm font-semibold">
                          Send an email
                        </span>

                        <span className="mt-0.5 break-all text-xs text-slate-500">
                          {email}
                        </span>
                      </a>
                    )}
                  </div>
                )}

                {address && (
                  <div className="max-w-md">
                    <address className="whitespace-pre-line break-words text-sm not-italic leading-6 text-slate-500">
                      {address}
                    </address>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-sm font-medium text-indigo-600 hover:underline"
                    >
                      View on map ↗
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* WEEKLY CALENDAR */}
        <section
          aria-labelledby="schedule-heading"
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2
                id="schedule-heading"
                className="text-lg font-semibold tracking-tight"
              >
                Your week at a glance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {bookingUrl
                  ? "Choose an available one-hour block to open our booking page."
                  : "Green blocks show available one-hour slots."}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Weekly schedule · 5 AM–9 PM
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full bg-emerald-500"
                />
                Available
              </span>

              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full bg-slate-200"
                />
                Unavailable
              </span>
            </div>
          </div>

          {totalSlots === 0 && (
            <div className="mx-6 mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No one-hour slots are currently available. Check back for
              an updated schedule.
            </div>
          )}

          <p className="px-6 pt-4 text-xs text-slate-400 lg:hidden">
            Scroll sideways to see the full week.
          </p>

          {/* Keep the full fixed range visible, even when all slots are off. */}
          <div
            role="region"
            aria-label="Weekly availability calendar"
            tabIndex={0}
            className="overflow-x-auto p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 sm:p-6"
          >
            <table className="w-full min-w-[900px] table-fixed border-separate border-spacing-0 text-sm">
              <caption className="sr-only">
                Weekly availability for {businessName}. Each block
                represents one hour, from 5 AM to 9 PM.
              </caption>

              <thead>
                <tr>
                  <th
                    scope="col"
                    className="w-20 px-2 pb-4 text-left align-top text-xs font-medium text-slate-400"
                  >
                    <span className="block pt-3">Time</span>
                    <span className="mt-1 block font-normal">
                      1-hour slots
                    </span>
                  </th>

                  {DAYS.map((day, index) => {
                    const count = availableHoursByDay[index].length;
                    const hasSlots = count > 0;

                    return (
                      <th
                        key={day}
                        scope="col"
                        className="px-1 pb-4 align-top font-normal"
                      >
                        <div
                          className={`rounded-xl px-2 py-3 ${
                            hasSlots ? "bg-indigo-50" : "bg-slate-50"
                          }`}
                        >
                          <span
                            className={`block text-sm font-semibold ${
                              hasSlots
                                ? "text-indigo-700"
                                : "text-slate-400"
                            }`}
                          >
                            {day.slice(0, 3)}
                            <span className="sr-only">
                              {day.slice(3)}
                            </span>
                          </span>

                          <span className="mt-2 block text-[11px] text-slate-500">
                            {hasSlots
                              ? `${count} ${
                                  count === 1 ? "slot" : "slots"
                                }`
                              : "No slots"}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {HOURS.map((hour) => {
                  const startLabel = hourLabel(hour);
                  const endLabel = hourLabel(hour + 1);

                  return (
                    <tr key={hour}>
                      <th
                        scope="row"
                        className="px-2 py-2 text-left align-middle text-xs font-medium tabular-nums text-slate-500"
                      >
                        {startLabel}
                      </th>

                      {DAYS.map((day, dayIndex) => {
                        const available =
                          availableHoursByDay[dayIndex].includes(hour);

                        const label =
                          `${day}, ${startLabel}–${endLabel}`;

                        return (
                          <td key={day} className="p-1">
                            {available && bookingUrl ? (
                              <a
                                href={bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${label}: open booking page in a new tab`}
                                title={`${label} — open booking page`}
                                className="flex h-16 flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-1 text-center transition hover:border-emerald-400 hover:bg-emerald-100 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                              >
                                <span className="whitespace-nowrap text-[11px] font-semibold tabular-nums text-emerald-800">
                                  {startLabel}–{endLabel}
                                </span>

                                <span className="mt-1 text-[10px] font-medium text-emerald-700">
                                  Book ↗
                                </span>
                              </a>
                            ) : available ? (
                              <div
                                title={`${label}: available`}
                                className="flex h-16 flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-1 text-center"
                              >
                                <span className="whitespace-nowrap text-[11px] font-semibold tabular-nums text-emerald-800">
                                  {startLabel}–{endLabel}
                                </span>

                                <span className="mt-1 text-[10px] text-emerald-700">
                                  Available
                                </span>
                              </div>
                            ) : (
                              <div
                                title={`${label}: unavailable`}
                                className="flex h-16 items-center justify-center rounded-xl border border-slate-100 bg-slate-50"
                              >
                                <span className="sr-only">
                                  {label}: unavailable
                                </span>

                                <span
                                  aria-hidden="true"
                                  className="text-slate-300"
                                >
                                  —
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:px-8">
            <p className="text-sm leading-6 text-slate-500">
              {bookingUrl
                ? "Booking opens in a new tab. Select and confirm your appointment on the booking website."
                : phone || email
                  ? "Contact us using the details above to confirm your appointment."
                  : "This schedule shows regular weekly availability. Appointments require confirmation."}
            </p>

            <p className="text-xs text-slate-400">
              Each block is one hour. The last block is 8 PM–9 PM.
            </p>
          </div>
        </section>

        <footer className="pb-4 text-center text-xs text-slate-400">
          Powered by{" "}
          <a
            href="https://simplebookme.com"
            className="font-medium text-slate-500 transition hover:text-indigo-600"
          >
            SimpleBookMe
          </a>
        </footer>
      </div>
    </main>
  );
}