import { describe, expect, it } from "vitest";
import { formatAmount, roundToCurrency } from "./currency";

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

describe("formatAmount", () => {
  it("groups thousands with the currency's decimals", () => {
    expect(formatAmount(1234.5, "PHP")).toBe("1,234.50");
    expect(formatAmount(1234.6, "JPY")).toBe("1,235");
  });
  it("caps decimals for summary figures", () => {
    expect(formatAmount(1234.56, "USD", { maximumFractionDigits: 0 })).toBe("1,235");
  });
  it("keeps the sign", () => {
    expect(formatAmount(-50, "PHP")).toBe("-50.00");
  });
});
