import { describe, expect, it } from "vitest";
import { roundToCurrency } from "./currency";

describe("roundToCurrency", () => {
  it("rounds to 2 decimals for PHP/USD", () => {
    expect(roundToCurrency(12.345678, "PHP")).toBe(12.35);
    expect(roundToCurrency(1.005, "USD")).toBe(1.01);
  });
  it("rounds to whole units for zero-decimal currencies", () => {
    expect(roundToCurrency(1234.6, "JPY")).toBe(1235);
    expect(roundToCurrency(10000.4, "KRW")).toBe(10000);
  });
  it("falls back to 2 decimals for unknown codes", () => {
    expect(roundToCurrency(1.239, "ZZZ")).toBe(1.24);
  });
});
