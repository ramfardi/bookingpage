export function createICS({
  uid,
  title,
  description,
  date,
  time,
  durationMinutes = 60,
}: {
  uid: string;
  title: string;
  description: string;
  date: string;
  time: string;
  durationMinutes?: number;
}) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    throw new Error("Invalid appointment date or time");
  }

  /*
   * Date.UTC is used only for safe date arithmetic.
   * DTSTART and DTEND below deliberately do not include Z,
   * so they remain floating local times.
   */
  const start = new Date(
    Date.UTC(year, month - 1, day, hour, minute, 0)
  );

  const end = new Date(
    start.getTime() + durationMinutes * 60_000
  );

  const pad = (value: number) => String(value).padStart(2, "0");

  const formatFloating = (value: Date) =>
    `${value.getUTCFullYear()}` +
    `${pad(value.getUTCMonth() + 1)}` +
    `${pad(value.getUTCDate())}` +
    `T` +
    `${pad(value.getUTCHours())}` +
    `${pad(value.getUTCMinutes())}` +
    `${pad(value.getUTCSeconds())}`;

  const formatUtc = (value: Date) =>
    value.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const escapeICS = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//SimpleBookMe//EN",
    "BEGIN:VEVENT",
    `UID:${escapeICS(uid)}`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatFloating(start)}`,
    `DTEND:${formatFloating(end)}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}