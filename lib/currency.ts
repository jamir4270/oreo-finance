/**
 * Converts between currencies using rates relative to one base (USD from Open Exchange Rates).
 * Returns null when either rate is missing. Use this wherever the result is stored, so a
 * missing rate can never write an unconverted amount (e.g. KRW 10,000 saved as PHP 10,000).
 */
export function tryConvertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number | null {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];
  if (!fromRate || !toRate) return null;
  return (amount / fromRate) * toRate;
}

/**
 * Display-only conversion: falls back to the unconverted amount when a rate is missing, so
 * a page still renders. That only happens when rates are unavailable, and the stale-rate
 * banner is shown then. Never store the result; use tryConvertCurrency.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  const converted = tryConvertCurrency(amount, fromCurrency, toCurrency, rates);
  if (converted === null) {
    console.error(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`);
    return amount;
  }
  return converted;
}

/** Minor-unit digits for a currency: 2 for PHP/USD, 0 for JPY/KRW/VND. Unknown codes get 2. */
export function currencyDecimals(currency: string): number {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

/**
 * Formats an amount for display: thousands separators and the currency's own decimals
 * (1,234.50 PHP, 1,235 JPY). No symbol, so callers keep their symbol/code layout.
 * Pass maximumFractionDigits: 0 for summary figures.
 * shortcut: fixed "en" grouping so server and client render identically (no hydration
 * mismatch); switch to the user's locale once it's stored on the profile.
 */
export function formatAmount(
  amount: number,
  currency: string,
  { maximumFractionDigits }: { maximumFractionDigits?: number } = {}
): string {
  const digits = Math.min(currencyDecimals(currency), maximumFractionDigits ?? Infinity);
  return new Intl.NumberFormat("en", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amount);
}

/**
 * Rounds to the currency's minor unit (2 decimals for PHP/USD, 0 for JPY/KRW/VND),
 * so converted amounts aren't stored as 12.3456789.
 */
export function roundToCurrency(amount: number, currency: string): number {
  const factor = 10 ** currencyDecimals(currency);
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

/**
 * The base-currency value to freeze on a transaction at save time (see amountIn).
 * Both null when there's no base currency or the rate is unavailable.
 */
export function baseSnapshot(
  amount: number,
  accountCurrency: string,
  baseCurrency: string | null,
  rates: Record<string, number>
): { base_amount: number | null; base_currency: string | null } {
  if (!baseCurrency) return { base_amount: null, base_currency: null };
  const converted = tryConvertCurrency(amount, accountCurrency, baseCurrency, rates);
  return converted === null
    ? { base_amount: null, base_currency: null }
    : { base_amount: roundToCurrency(converted, baseCurrency), base_currency: baseCurrency };
}

/**
 * A transaction's amount in `currency`, preferring the value stored when it was saved
 * (base_amount, at that day's rate) so history doesn't drift with exchange rates. Falls
 * back to live conversion for older rows or when `currency` differs from what was stored.
 */
export function amountIn(
  txn: { amount: number | string; base_amount?: number | string | null; base_currency?: string | null; account?: { currency?: string } | null },
  currency: string,
  rates: Record<string, number>
): number {
  if (txn.base_amount != null && txn.base_currency === currency) return Number(txn.base_amount);
  return convertCurrency(Number(txn.amount), txn.account?.currency || currency, currency, rates);
}

export const CURRENCIES = [
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "PLN", name: "Polish Złoty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "CLP", name: "Chilean Peso", symbol: "CLP$" },
  { code: "ARS", name: "Argentine Peso", symbol: "ARS$" },
  { code: "COP", name: "Colombian Peso", symbol: "COP$" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵" },
] as const;

export function getCurrencySymbol(currency: string): string {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    const symbolPart = parts.find((p) => p.type === "currency");
    return symbolPart?.value || currency;
  } catch {
    return currency;
  }
}
