// Empty string means no booking link.
// null means an invalid link.
export function normalizeBookingUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.length > 2048) return null;

  try {
    const url = new URL(trimmed);

    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}