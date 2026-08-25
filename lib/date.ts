/* =====================================================
   DATE / TIME UTILITIES
   Backend uses: Instant (UTC ISO string)
   Client uses: local timezone
   ===================================================== */

/**
 * Instant (ISO, UTC) → readable local datetime
 * For display only (booking list, details, history)
 */
export function instantToReadable(
  instant?: string | null,
  locale: string = "en-IN"
): string {
  if (!instant) return "—";

  const date = new Date(instant);

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/**
 * Instant (ISO, UTC) → datetime-local input value
 * Example output: "2026-01-04T09:30"
 */
export function instantToInputValue(
  instant?: string | null
): string {
  if (!instant) return "";

  const d = new Date(instant);

  // shift to local timezone for input
  const tzOffset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tzOffset);

  return local.toISOString().slice(0, 16);
}

/**
 * datetime-local input value → Instant (UTC ISO)
 * Backend-aligned, timezone-safe
 */
export function inputValueToInstant(
  value?: string | null
): string | null {
  if (!value) return null;

  // browser interprets this as local time
  const date = new Date(value);

  return date.toISOString(); // UTC Instant
}
