export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// 05:00–06:00 through 20:00–21:00.
export const HOURS = Array.from({ length: 16 }, (_, i) => i + 5);

export type SlotOverrides = Record<string, Record<string, boolean>>;

type ScheduleData = {
  selectedDays?: string[];
  dayTimes?: Record<string, { start: string; end: string }>;
  slotOverrides?: SlotOverrides;
};

function toMinutes(value?: string): number | null {
  const match = value
    ?.trim()
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

export function hourLabel(hour: number): string {
  return `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;
}

export function getAvailableHours(data: ScheduleData): number[][] {
  const schedules = DAYS.map((day) => {
    if (!data.selectedDays?.includes(day)) return null;

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

    return { start, end: end < start ? end + 1440 : end };
  });

  return DAYS.map((day, index) => {
    const current = schedules[index];
    const previous = schedules[(index + 6) % 7];
    const intervals: Array<{ start: number; end: number }> = [];

    if (current) {
      intervals.push({
        start: current.start,
        end: Math.min(current.end, 1440),
      });
    }

    if (previous && previous.end > 1440) {
      intervals.push({
        start: 0,
        end: previous.end - 1440,
      });
    }

    const merged = intervals
      .sort((a, b) => a.start - b.start)
      .reduce<Array<{ start: number; end: number }>>((result, item) => {
        const last = result[result.length - 1];

        if (last && item.start <= last.end) {
          last.end = Math.max(last.end, item.end);
        } else {
          result.push({ ...item });
        }

        return result;
      }, []);

    return HOURS.filter((hour) => {
      const override = data.slotOverrides?.[day]?.[String(hour)];

      // false explicitly removes a block; true adds it.
      if (typeof override === "boolean") return override;

      return merged.some(
        (interval) =>
          interval.start <= hour * 60 &&
          interval.end >= (hour + 1) * 60
      );
    });
  });
}

export function isSlotOverrides(value: unknown): value is SlotOverrides {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).every(([day, slots]) => {
    if (
      !DAYS.includes(day) ||
      !slots ||
      typeof slots !== "object" ||
      Array.isArray(slots)
    ) {
      return false;
    }

    return Object.entries(slots).every(
      ([hour, available]) =>
        HOURS.some((allowed) => String(allowed) === hour) &&
        typeof available === "boolean"
    );
  });
}