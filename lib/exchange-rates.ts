import { createClient } from "@/lib/supabase/server";

export interface ExchangeRatesData {
  base_currency: string;
  rates: Record<string, number>;
  fetched_at: string;
}

/**
 * Fetches the latest exchange rates.
 * Checks the local Supabase cache first. If older than 24 hours (or missing),
 * fetches fresh rates from Open Exchange Rates and caches them.
 */
export async function getExchangeRates(): Promise<{ rates: Record<string, number>; isStale: boolean }> {
  const supabase = await createClient();

  // 1. Check local cache
  const { data: cached } = await supabase
    .from("exchange_rates")
    .select("*")
    .order("fetched_at", { ascending: false })
    .limit(1)
    .single();

  const now = new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  
  const isCacheValid =
    cached &&
    now.getTime() - new Date(cached.fetched_at).getTime() < ONE_DAY_MS;

  if (isCacheValid && cached.rates) {
    return { rates: cached.rates, isStale: false };
  }

  // 2. Fetch fresh rates if cache is stale or missing
  try {
    const appId = process.env.OPENEXCHANGERATES_APP_ID;
    if (!appId) {
      throw new Error("Missing Open Exchange Rates App ID");
    }

    const response = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${appId}`,
      { next: { revalidate: 3600 } } // Also use next caching as a fallback
    );

    if (!response.ok) {
      throw new Error(`OXR fetch failed with status: ${response.status}`);
    }

    const data = await response.json();
    const rates = data.rates;

    // 3. Cache the new rates using service role to bypass RLS
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (supabaseUrl && supabaseServiceKey) {
      const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey);
      await adminClient.from("exchange_rates").insert({
        base_currency: "USD",
        rates: rates,
      });
    }

    return { rates, isStale: false };
  } catch (error) {
    console.error("Failed to fetch fresh exchange rates:", error);
    
    // 4. Fallback to stale cache if available
    if (cached && cached.rates) {
      return { rates: cached.rates, isStale: true };
    }
    
    // If no cache and fetch failed, we return an empty dict, or a basic fallback
    return { rates: { USD: 1 }, isStale: true };
  }
}
