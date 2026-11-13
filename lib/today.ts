import { cache } from "react";
import { cookies } from "next/headers";
import { TZ_COOKIE, dayInTimeZone, isValidTimeZone } from "@/lib/dates";

/**
 * The user's "today" on the server (Vercel runs in UTC). The zone comes from the device via
 * the tz cookie (components/TimezoneCookie.tsx); it is user input, so it's validated first.
 * shortcut: per-device cookie, so server jobs with no request (e.g. reminders) can't see it;
 * persist it to profiles when those exist.
 */
export const getToday = cache(async (): Promise<string> => {
  const tz = (await cookies()).get(TZ_COOKIE)?.value;
  return dayInTimeZone(isValidTimeZone(tz) ? tz : "UTC");
});
