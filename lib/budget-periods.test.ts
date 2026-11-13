import { describe, expect, it } from "vitest";
import { computePeriodBounds } from "./budget-periods";

// Noon UTC keeps the reference on the same calendar day in any timezone within ±12h.
const on = (d: string) => new Date(`${d}T12:00:00Z`);
const monthly = (start_date: string) => ({ period_type: "monthly", start_date, end_date: null });

describe("computePeriodBounds — monthly", () => {
  it("regression: anchor 31 on Mar 1 starts in February, not after today", () => {
    expect(computePeriodBounds(monthly("2026-01-31"), on("2026-03-01"))).toEqual({
      periodStart: "2026-02-28",
      periodEnd: "2026-03-30",
    });
  });

  it("clamps to Feb 29 in leap years", () => {
    expect(computePeriodBounds(monthly("2028-01-31"), on("2028-02-29"))).toEqual({
      periodStart: "2028-02-29",
      periodEnd: "2028-03-30",
    });
  });

  it("anchor 1 covers the calendar month", () => {
    expect(computePeriodBounds(monthly("2026-01-01"), on("2026-02-15"))).toEqual({
      periodStart: "2026-02-01",
      periodEnd: "2026-02-28",
    });
  });

  it("wraps across the year boundary", () => {
    expect(computePeriodBounds(monthly("2026-01-15"), on("2027-01-10"))).toEqual({
      periodStart: "2026-12-15",
      periodEnd: "2027-01-14",
    });
  });

  it("every period contains its reference day and periods are contiguous", () => {
    for (const anchor of ["2026-01-28", "2026-01-29", "2026-01-30", "2026-01-31"]) {
      let prevEnd: string | null = null;
      for (let t = on("2026-02-01").getTime(); t < on("2027-02-01").getTime(); t += 86_400_000) {
        const ref = new Date(t);
        const day = ref.toISOString().slice(0, 10);
        const { periodStart, periodEnd } = computePeriodBounds(monthly(anchor), ref);
        expect(periodStart <= day && day <= periodEnd, `${anchor} @ ${day}`).toBe(true);
        if (prevEnd && periodStart > prevEnd) {
          const gap = (Date.parse(periodStart) - Date.parse(prevEnd)) / 86_400_000;
          expect(gap, `${anchor} gap before ${periodStart}`).toBe(1);
        }
        prevEnd = periodEnd;
      }
    }
  });
});

describe("computePeriodBounds — weekly/daily", () => {
  it("weekly windows are 7 days from the anchor", () => {
    expect(
      computePeriodBounds({ period_type: "weekly", start_date: "2026-11-02", end_date: null }, on("2026-11-13"))
    ).toEqual({ periodStart: "2026-11-09", periodEnd: "2026-11-15" });
  });

  it("daily windows are the day itself", () => {
    expect(
      computePeriodBounds({ period_type: "daily", start_date: "2026-11-01", end_date: null }, on("2026-11-13"))
    ).toEqual({ periodStart: "2026-11-13", periodEnd: "2026-11-13" });
  });
});
