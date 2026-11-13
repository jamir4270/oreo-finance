"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TZ_COOKIE } from "@/lib/dates";

/**
 * Tells the server the device's time zone. Runs on every page (including login), so by
 * the time the app renders the cookie is usually set; if it was missing or the device
 * changed zones (travel), re-render once so "today" is right immediately.
 */
export function TimezoneCookie() {
  const router = useRouter();
  useEffect(() => {
    let tz: string;
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return;
    }
    const current = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${TZ_COOKIE}=`))
      ?.slice(TZ_COOKIE.length + 1);
    if (!tz || current === tz) return;
    // IANA names only contain cookie-safe characters (letters, "/", "_", "+", "-")
    document.cookie = `${TZ_COOKIE}=${tz}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);
  return null;
}
