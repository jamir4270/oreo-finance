import { describe, expect, it } from "vitest";
import { amountIn, formatAmount, roundToCurrency, tryConvertCurrency, convertCurrency } from "./currency";

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

describe("tryConvertCurrency", () => {
  const rates = { USD: 1, PHP: 56, JPY: 150 };
  it("converts through the USD base", () => {
    expect(tryConvertCurrency(56, "PHP", "USD", rates)).toBe(1);
    expect(tryConvertCurrency(1, "USD", "JPY", rates)).toBe(150);
  });
  it("needs no rate for the same currency", () => {
    expect(tryConvertCurrency(10, "KRW", "KRW", {})).toBe(10);
  });
  it("regression: returns null instead of the unconverted amount when a rate is missing", () => {
    expect(tryConvertCurrency(10000, "KRW", "PHP", rates)).toBeNull();
    expect(tryConvertCurrency(10000, "KRW", "PHP", { USD: 1 })).toBeNull();
  });
  it("display-only convertCurrency still falls back so pages render", () => {
    expect(convertCurrency(10000, "KRW", "PHP", rates)).toBe(10000);
  });
});

describe("amountIn", () => {
  const today = { USD: 1, PHP: 60 }; // rate has moved since the transaction was saved
  const txn = { amount: 10, base_amount: 560, base_currency: "PHP", account: { currency: "USD" } };
  it("regression: uses the value frozen at save time, not today's rate", () => {
    expect(amountIn(txn, "PHP", today)).toBe(560);
  });
  it("falls back to live conversion for older rows or a different currency", () => {
    expect(amountIn({ ...txn, base_amount: null, base_currency: null }, "PHP", today)).toBe(600);
    expect(amountIn(txn, "USD", today)).toBe(10);
  });
});
