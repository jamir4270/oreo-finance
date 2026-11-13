import { describe, expect, it } from "vitest";
import { dueOccurrences, occurrenceAfter } from "./recurrence";

describe("occurrenceAfter", () => {
  it("steps daily and weekly", () => {
    expect(occurrenceAfter("2026-11-01", "daily", "2026-11-13")).toBe("2026-11-14");
    expect(occurrenceAfter("2026-11-02", "weekly", "2026-11-13")).toBe("2026-11-16");
    expect(occurrenceAfter("2026-11-02", "weekly", "2026-11-09")).toBe("2026-11-16");
  });
  it("monthly on the 31st clamps to short months and returns to the 31st", () => {
    expect(occurrenceAfter("2026-01-31", "monthly", "2026-01-31")).toBe("2026-02-28");
    expect(occurrenceAfter("2026-01-31", "monthly", "2026-02-28")).toBe("2026-03-31");
    expect(occurrenceAfter("2026-01-31", "monthly", "2026-04-01")).toBe("2026-04-30");
  });
  it("yearly on Feb 29 lands on Feb 28 in non-leap years", () => {
    expect(occurrenceAfter("2028-02-29", "yearly", "2028-02-29")).toBe("2029-02-28");
    expect(occurrenceAfter("2028-02-29", "yearly", "2031-03-01")).toBe("2032-02-29");
  });
  it("crosses the year boundary monthly", () => {
    expect(occurrenceAfter("2026-11-15", "monthly", "2026-12-15")).toBe("2027-01-15");
  });
});

describe("dueOccurrences", () => {
  const rule = { start_date: "2026-10-01", frequency: "monthly" as const, next_date: "2026-10-01", end_date: null };
  it("returns every missed occurrence through today and the next one", () => {
    expect(dueOccurrences(rule, "2026-12-05")).toEqual({ dates: ["2026-10-01", "2026-11-01", "2026-12-01"], next: "2027-01-01" });
  });
  it("nothing due yet", () => {
    expect(dueOccurrences({ ...rule, next_date: "2026-12-01" }, "2026-11-13")).toEqual({ dates: [], next: "2026-12-01" });
  });
  it("stops at end_date", () => {
    expect(dueOccurrences({ ...rule, end_date: "2026-11-15" }, "2026-12-05").dates).toEqual(["2026-10-01", "2026-11-01"]);
  });
  it("caps runaway backfills", () => {
    const daily = { start_date: "2020-01-01", frequency: "daily" as const, next_date: "2020-01-01", end_date: null };
    expect(dueOccurrences(daily, "2026-11-13", 366).dates).toHaveLength(366);
  });
});
