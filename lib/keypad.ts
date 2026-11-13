export type KeypadKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "." | "back";

const MAX_INTEGER_DIGITS = 9;

/**
 * Applies one keypad press to an amount string, the way a calculator-style money pad does:
 * no leading zeros, one decimal point, at most `maxDecimals` fraction digits
 * (0 for JPY/KRW, so "." is ignored there).
 */
export function applyKey(current: string, key: KeypadKey, maxDecimals = 2): string {
  if (key === "back") return current.slice(0, -1);

  if (key === ".") {
    if (maxDecimals === 0 || current.includes(".")) return current;
    return (current || "0") + ".";
  }

  const [int, frac] = current.split(".");
  if (frac !== undefined) {
    return frac.length >= maxDecimals ? current : current + key;
  }
  if (int === "0") return key; // replace a lone leading zero
  if (int.length >= MAX_INTEGER_DIGITS) return current;
  return current + key;
}
