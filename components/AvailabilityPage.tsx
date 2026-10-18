type DayHours = {
  start: string;
  end: string;
};

type Props = {
  data: {
    businessName?: string;
    selectedDays?: string[];
    dayTimes?: Record<string, DayHours>;
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    logoDataUrl?: string;
  };
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Supports "09:30", "9 AM", and "9:30 PM".
function toMinutes(value?: string): number | null {
  if (!value) return null;

  const match = value
    .trim()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);

  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const period = match[3]?.toUpperCase();

  if (minute > 59) return null;

  if (period) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (period === "PM" ? 12 : 0);
  } else if (hour > 24 || (hour === 24 && minute !== 0)) {
    return null;
  }

  return hour * 60 + minute;
}

function formatTime(minutes: number) {
  const normalized = minutes % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}`;
}

export default function AvailabilityPage({ data }: Props) {
  const businessName = data.businessName?.trim() || "Availability";
  const selectedDays = data.selectedDays || [];

  const email = data.contact?.email?.trim() || "";
  const phone = data.contact?.phone?.trim() || "";
  const address = data.contact?.address?.trim() || "";
  const phoneHref = phone.replace(/[^\d+]/g, "");

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

  // Overnight hours continue into the following calendar day.
  const schedules = DAYS.map((day) => {
    if (!selectedDays.includes(day)) return null;

    const start = toMinutes(data.dayTimes?.[day]?.start);
    const end = toMinutes(data.dayTimes?.[day]?.end);

    if (
      start === null ||
      end === null ||
      start >= 1440 ||
      start === end
    ) {
      return null;
    }

    return {
      start,
      end: end < start ? end + 1440 : end,
    };
  });

  const intervals = DAYS.map((_, index) => {
    const result: Array<{ start: number; end: number }> = [];
    const current = schedules[index];
    const previous = schedules[(index + 6) % 7];

    if (current) {
      result.push({
        start: current.start,
        end: Math.min(current.end, 1440),
      });
    }

    if (previous && previous.end > 1440) {
      result.push({
        start: 0,
        end: previous.end - 1440,
      });
    }

    // Merge overlaps so the weekly total doesn't count minutes twice.
    return result
      .sort((a, b) => a.start - b.start)
      .reduce<Array<{ start: number; end: number }>>((merged, item) => {
        const last = merged[merged.length - 1];

        if (last && item.start <= last.end) {
          last.end = Math.max(last.end, item.end);
        } else {
          merged.push({ ...item });
        }

        return merged;
      }, []);
  });

  const allIntervals = intervals.flat();
  const activeDays = intervals.filter((items) => items.length > 0).length;

  const totalMinutes = allIntervals.reduce(
    (sum, item) => sum + item.end - item.start,
    0
  );

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const weeklyDuration = remainingMinutes
    ? `${totalHours}h ${remainingMinutes}m`
    : `${totalHours}h`;

  // Adapt the grid to the schedule, including one hour of context.
  const firstHour = allIntervals.length
    ? Math.max(
        0,
        Math.floor(Math.min(...allIntervals.map((item) => item.start)) / 60) -
          1
      )
    : 8;

  const lastHour = allIntervals.length
    ? Math.min(
        24,
        Math.ceil(Math.max(...allIntervals.map((item) => item.end)) / 60) +
          1
      )
    : 18;

  const hours = Array.from(
    { length: lastHour - firstHour },
    (_, index) => firstHour + index
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

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {activeDays} {activeDays === 1 ? "day" : "days"} a week
                </span>

                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  {weeklyDuration} available
                </span>
              </div>
            </div>

            {hasContact && (
              <div className="mt-6 flex flex-col gap-5 border-t border-slate-100 pt-6 lg:flex-row lg:items-center lg:justify-between">
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
                Green blocks show scheduled availability.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
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

          {allIntervals.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h3 className="font-semibold text-slate-700">
                No hours posted yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Check back for an updated schedule.
              </p>
            </div>
          ) : (
            <>
              <p className="px-6 pt-4 text-xs text-slate-400 md:hidden">
                Swipe sideways to see the full week.
              </p>

              <div
                role="region"
                aria-label="Weekly availability calendar"
                tabIndex={0}
                className="overflow-x-auto p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 sm:p-6"
              >
                <table className="w-full min-w-[820px] table-fixed border-separate border-spacing-0 text-sm">
                  <caption className="sr-only">
                    Weekly availability for {businessName}. Times use a
                    24-hour clock.
                  </caption>

                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="w-20 px-2 pb-5 text-left align-top text-xs font-medium text-slate-400"
                      >
                        <span className="block pt-3">Time</span>
                        <span className="mt-1 block font-normal">
                          24-hour
                        </span>
                      </th>

                      {DAYS.map((day, index) => {
                        const available = intervals[index].length > 0;

                        return (
                          <th
                            key={day}
                            scope="col"
                            className="px-1 pb-5 align-top font-normal"
                          >
                            <div
                              className={`min-h-[88px] rounded-xl px-2 py-3 ${
                                available
                                  ? "bg-indigo-50"
                                  : "bg-slate-50"
                              }`}
                            >
                              <span
                                className={`block text-sm font-semibold ${
                                  available
                                    ? "text-indigo-700"
                                    : "text-slate-400"
                                }`}
                              >
                                {day.slice(0, 3)}
                                <span className="sr-only">
                                  {day.slice(3)}
                                </span>
                              </span>

                              <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                                {available ? (
                                  intervals[index].map((item) => (
                                    <span
                                      key={`${item.start}-${item.end}`}
                                      className="block"
                                    >
                                      {formatTime(item.start)}–
                                      {item.end === 1440
                                        ? "24:00"
                                        : formatTime(item.end)}
                                    </span>
                                  ))
                                ) : (
                                  <span>Closed</span>
                                )}
                              </div>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody>
                    {hours.map((hour) => {
                      const slotStart = hour * 60;
                      const slotEnd = slotStart + 60;

                      return (
                        <tr key={hour}>
                          <th
                            scope="row"
                            className="px-2 py-0 text-left align-top text-xs font-normal tabular-nums text-slate-400"
                          >
                            {formatTime(slotStart)}
                          </th>

                          {DAYS.map((day, dayIndex) => {
                            const segments = intervals[dayIndex]
                              .map((item) => ({
                                start: Math.max(slotStart, item.start),
                                end: Math.min(slotEnd, item.end),
                              }))
                              .filter((item) => item.end > item.start);

                            const description = segments.length
                              ? segments
                                  .map(
                                    (item) =>
                                      `${formatTime(item.start)}–${
                                        item.end === 1440
                                          ? "24:00"
                                          : formatTime(item.end)
                                      }`
                                  )
                                  .join(", ")
                              : "Unavailable";

                            return (
                              <td
                                key={day}
                                className="px-1 py-0 align-top"
                              >
                                <div
                                  title={`${day}: ${description}`}
                                  className="relative h-12 overflow-hidden border-t border-white bg-slate-50"
                                >
                                  <span className="sr-only">
                                    {description}
                                  </span>

                                  {segments.map((segment) => (
                                    <div
                                      key={segment.start}
                                      aria-hidden="true"
                                      className="absolute inset-x-0 border-l-2 border-emerald-500 bg-emerald-100"
                                      style={{
                                        top: `${
                                          ((segment.start - slotStart) /
                                            60) *
                                          100
                                        }%`,
                                        height: `${
                                          ((segment.end - segment.start) /
                                            60) *
                                          100
                                        }%`,
                                      }}
                                    />
                                  ))}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:px-8">
            <p className="text-sm leading-6 text-slate-500">
              {phone || email
                ? "Have a time in mind? Contact us above to confirm your appointment."
                : "This schedule shows regular weekly availability. Appointments require confirmation."}
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