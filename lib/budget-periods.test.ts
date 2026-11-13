import { describe, expect, it } from "vitest";
import { chainRollover, computePeriodBounds, periodsToCreate, safeToSpend } from "./budget-periods";
import { addDays } from "./dates";

// Noon UTC keeps the reference on the same calendar day in any timezone within ±12h.
const on = (d: string) => d;
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
      for (let day = "2026-02-01"; day < "2027-02-01"; day = addDays(day, 1)) {
        const { periodStart, periodEnd } = computePeriodBounds(monthly(anchor), day);
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

describe("periodsToCreate", () => {
  const weekly = { period_type: "weekly", start_date: "2026-11-02", end_date: null };
  it("only the current period when nothing is stored yet", () => {
    expect(periodsToCreate(weekly, null, "2026-11-13")).toEqual([{ periodStart: "2026-11-09", periodEnd: "2026-11-15" }]);
  });
  it("regression: backfills skipped periods so the rollover chain has no gaps", () => {
    // last stored week ended Oct 25; user returns Nov 13 -> weeks of Oct 26, Nov 2, Nov 9
    expect(periodsToCreate(weekly, "2026-10-25", "2026-11-13")).toEqual([
      { periodStart: "2026-10-26", periodEnd: "2026-11-01" },
      { periodStart: "2026-11-02", periodEnd: "2026-11-08" },
      { periodStart: "2026-11-09", periodEnd: "2026-11-15" },
    ]);
  });
  it("monthly anchored on the 31st backfills without gaps", () => {
    const monthly = { period_type: "monthly", start_date: "2026-01-31", end_date: null };
    expect(periodsToCreate(monthly, "2026-02-27", "2026-04-05").map((p) => p.periodStart)).toEqual(["2026-02-28", "2026-03-31"]);
  });
});

describe("chainRollover", () => {
  it("carries surplus and deficit forward; the current period starts unspent", () => {
    const periods = [
      { periodStart: "2026-10-26", periodEnd: "2026-11-01" },
      { periodStart: "2026-11-02", periodEnd: "2026-11-08" },
      { periodStart: "2026-11-09", periodEnd: "2026-11-15" },
    ];
    const rows = chainRollover(100, 20, periods, [70, 150]);
    expect(rows.map((r) => [r.rollover_in, r.effective_limit, r.actual_spent])).toEqual([
      [20, 120, 70],   // 50 left over
      [50, 150, 150],  // spent it all
      [0, 100, 0],     // current
    ]);
  });
});

describe("safeToSpend", () => {
  it("spreads what's left over the days left, today included", () => {
    // 300 left, period ends in 2 days -> 3 days incl. today -> 100/day; daily budget 50 today
    const r = safeToSpend([{ remaining: 300, periodEnd: "2026-11-15" }, { remaining: 50, periodEnd: "2026-11-13" }], "2026-11-13");
    expect(r.perDay).toBe(150);
    expect(r.left).toBe(350);
    expect(r).toMatchObject({ overspent: 0, active: 2 });
  });
  it("counts overspent budgets without letting them go negative", () => {
    const r = safeToSpend([{ remaining: -40, periodEnd: "2026-11-30" }, { remaining: 170, periodEnd: "2026-11-29" }], "2026-11-13");
    expect(r.perDay).toBe(10);
    expect(r).toMatchObject({ overspent: 1, active: 2 });
  });
  it("ignores periods that already ended", () => {
    expect(safeToSpend([{ remaining: 500, periodEnd: "2026-11-01" }], "2026-11-13")).toMatchObject({ perDay: 0, active: 0 });
  });
});
