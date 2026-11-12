// Calendar dates (viewing dates, due dates) are days, not moments: the API
// stores "2026-12-01" as 2026-12-01T00:00:00Z. Formatting that in the
// viewer's local zone shows Nov 30 anywhere west of UTC, so always format
// them in UTC. Real timestamps (paidAt, createdAt) should NOT use these.

/** Formats a stored calendar date as the same day for every viewer. */
export function formatCalendarDate(
  iso: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(iso).toLocaleDateString(undefined, { ...options, timeZone: "UTC" });
}

/** The stored calendar date as "YYYY-MM-DD", for comparing with localDate(). */
export function calendarDateKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/** The viewer's own date as "YYYY-MM-DD", for date inputs. */
export function localDate(daysFromToday = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
