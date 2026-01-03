export function createICS({
  uid,
  title,
  description,
  start,
  durationMinutes = 60,
}: {
  uid: string;
  title: string;
  description: string;
  start: Date;
  durationMinutes?: number;
}) {
  const end = new Date(start.getTime() + durationMinutes * 60000);

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SimpleBookMe//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${fmt(new Date())}
DTSTART:${fmt(start)}
DTEND:${fmt(end)}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR
`.trim();
}
