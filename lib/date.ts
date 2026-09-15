/**
 * Formats a Storyblok date — `2026-09-08`, or a datetime `2026-09-08 00:00` — as
 * day, month, year: `08/09/2026`, or `08.09.2026` with a "." separator.
 *
 * Done by string split rather than `new Date()` on purpose: an ISO date-only
 * string is parsed as UTC, so formatting it in a negative-offset timezone shifts
 * it back a day — and server and browser would disagree. No parsing, no drift.
 * Anything that isn't a plain ISO date is passed through untouched.
 */
export function formatDate(value?: string, separator = "/"): string {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  const [, year, month, day] = match;
  return [day, month, year].join(separator);
}

/** The `YYYY-MM-DD` part, for a `<time dateTime>`. `undefined` when there is none. */
export function isoDate(value?: string): string | undefined {
  return value?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
}
