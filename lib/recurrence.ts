import { addDays } from "@/lib/dates";

export const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const pad = (n: number) => String(n).padStart(2, "0");

/** The n-th occurrence (0 = start). Monthly/yearly keep the start's day, clamped to short months. */
function nth(start: string, frequency: Frequency, n: number): string {
  if (frequency === "daily") return addDays(start, n);
  if (frequency === "weekly") return addDays(start, 7 * n);
  const [y, m, d] = start.split("-").map(Number);
  const months = frequency === "monthly" ? n : 12 * n;
  const total = (m - 1) + months;
  const year = y + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  return `${year}-${pad(month + 1)}-${pad(Math.min(d, daysInMonth(year, month)))}`;
}

/** First occurrence strictly after `date`. */
export function occurrenceAfter(start: string, frequency: Frequency, date: string): string {
  let n = 0;
  // Jump close for daily/weekly instead of stepping day by day
  if (frequency === "daily" || frequency === "weekly") {
    const step = frequency === "daily" ? 1 : 7;
    const days = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000);
    n = Math.max(0, Math.floor(days / step));
  }
  while (nth(start, frequency, n) <= date) n++;
  return nth(start, frequency, n);
}

/**
 * Occurrences due from `nextDate` through `today` (inclusive), and the next one after them.
 * Capped so a rule left alone for years can't create thousands of rows in one request.
 */
export function dueOccurrences(
  rule: { start_date: string; frequency: Frequency; next_date: string; end_date: string | null },
  today: string,
  cap = 366
): { dates: string[]; next: string } {
  const dates: string[] = [];
  let d = rule.next_date;
  while (d <= today && (!rule.end_date || d <= rule.end_date) && dates.length < cap) {
    dates.push(d);
    d = occurrenceAfter(rule.start_date, rule.frequency, d);
  }
  return { dates, next: d };
}
