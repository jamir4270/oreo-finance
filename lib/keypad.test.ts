import { describe, expect, it } from "vitest";
import { applyKey, type KeypadKey } from "./keypad";

const type = (keys: KeypadKey[], maxDecimals = 2) => keys.reduce((s, k) => applyKey(s, k, maxDecimals), "");

describe("applyKey", () => {
  it("builds a normal amount", () => {
    expect(type(["1", "2", ".", "5", "0"])).toBe("12.50");
  });
  it("caps fraction digits at the currency's minor unit", () => {
    expect(type(["1", ".", "2", "3", "4"])).toBe("1.23");
  });
  it("allows only one decimal point", () => {
    expect(type(["1", ".", ".", "5"])).toBe("1.5");
  });
  it("prefixes a bare point with zero", () => {
    expect(type([".", "5"])).toBe("0.5");
  });
  it("replaces a lone leading zero", () => {
    expect(type(["0", "0", "7"])).toBe("7");
  });
  it("ignores the point for zero-decimal currencies", () => {
    expect(type(["1", ".", "5"], 0)).toBe("15");
  });
  it("backspace removes the last character and stops at empty", () => {
    expect(type(["1", ".", "5", "back", "back", "back", "back"])).toBe("");
  });
  it("caps integer digits", () => {
    expect(type(Array(12).fill("9") as KeypadKey[])).toBe("999999999");
  });
});
