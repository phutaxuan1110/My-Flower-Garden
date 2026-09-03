// Date-only values (receivedDate) must never round-trip through UTC ISO
// conversion (`toISOString()` / `new Date(dateOnlyString)`), because that
// silently shifts the calendar day for any timezone ahead of UTC during
// the early hours of the day (e.g. Vietnam, UTC+7, between 00:00-06:59
// local time `toISOString()` still reports the *previous* UTC day).
// These helpers always read/write the browser's local calendar date.

export function todayLocalDateString(): string {
  return formatLocalDateString(new Date());
}

export function formatLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parses a "YYYY-MM-DD" string as a local-timezone Date (midnight local),
 * instead of `new Date(str)` which the spec treats as UTC midnight and can
 * display as the previous day in timezones behind UTC, or the next day in
 * timezones ahead of UTC once formatted back with `toLocaleDateString`.
 */
export function parseLocalDateString(value: string): Date {
  const [y, m, d] = value.split("-").map((v) => parseInt(v, 10));
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}
