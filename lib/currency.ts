/**
 * Converts an amount from one currency to another using the provided exchange rates.
 * Exchange rates must be relative to the same base currency (typically USD).
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) {
    // If we don't have the rate for either currency, we can't reliably convert.
    // In a real app we might throw, but returning the original amount is safer to prevent crashes.
    console.error(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`);
    return amount;
  }

  // Convert to base currency (USD), then to target currency
  return (amount / fromRate) * toRate;
}
