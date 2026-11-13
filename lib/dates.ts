/**
 * Calendar days as "YYYY-MM-DD" strings, the same shape as Postgres `date` columns.
 * "Today" depends on where the user is, so never derive it from toISOString() (always UTC).
 */

/** Today (or `date`) in an IANA time zone, e.g. "Asia/Manila". */
export function dayInTimeZone(timeZone: string, date = new Date()): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** Today (or `date`) in the device's own time zone. Browser code only. */
export function localDay(date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function isValidTimeZone(timeZone: string | undefined): timeZone is string {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Calendar arithmetic on a day string (UTC math, so no DST surprises). */
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** Inclusive bounds for the transaction/analytics date filters, relative to `today`. */
export function dateRangeBounds(range: string, today: string): { start?: string; end?: string } {
  const monthStart = `${today.slice(0, 7)}-01`;
  switch (range) {
    case "last_30":
      return { start: addDays(today, -30) };
    case "this_month":
      return { start: monthStart };
    case "last_month": {
      const end = addDays(monthStart, -1);
      return { start: `${end.slice(0, 7)}-01`, end };
    }
    case "this_year":
      return { start: `${today.slice(0, 4)}-01-01` };
    default:
      return {};
  }
}

/** Cookie carrying the device's IANA time zone so server code can compute the user's "today". */
export const TZ_COOKIE = "tz";
