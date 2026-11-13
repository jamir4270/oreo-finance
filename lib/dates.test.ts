import { describe, expect, it } from "vitest";
import { addDays, dateRangeBounds, dayInTimeZone, isValidTimeZone } from "./dates";

describe("dayInTimeZone", () => {
  it("regression: 07:00 in Manila is already the next day while UTC is still yesterday", () => {
    const instant = new Date("2026-11-13T23:00:00Z"); // 07:00 Nov 14 in Manila
    expect(dayInTimeZone("UTC", instant)).toBe("2026-11-13");
    expect(dayInTimeZone("Asia/Manila", instant)).toBe("2026-11-14");
  });
});

describe("isValidTimeZone", () => {
  it("accepts IANA zones and rejects junk", () => {
    expect(isValidTimeZone("Asia/Manila")).toBe(true);
    expect(isValidTimeZone("Not/AZone")).toBe(false);
    expect(isValidTimeZone(undefined)).toBe(false);
  });
});

describe("addDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("dateRangeBounds", () => {
  it("computes each preset", () => {
    expect(dateRangeBounds("last_30", "2026-03-15")).toEqual({ start: "2026-02-13" });
    expect(dateRangeBounds("this_month", "2026-03-15")).toEqual({ start: "2026-03-01" });
    expect(dateRangeBounds("last_month", "2026-01-15")).toEqual({ start: "2025-12-01", end: "2025-12-31" });
    expect(dateRangeBounds("this_year", "2026-03-15")).toEqual({ start: "2026-01-01" });
    expect(dateRangeBounds("all_time", "2026-03-15")).toEqual({});
  });
});
