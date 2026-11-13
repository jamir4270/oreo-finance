import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getExchangeRates } from "@/lib/exchange-rates";
import { baseSnapshot } from "@/lib/currency";
import { dueOccurrences, type Frequency } from "@/lib/recurrence";
import { getToday } from "@/lib/today";

type Rule = {
  id: string;
  type: string;
  account_id: string;
  category_id: string;
  amount: number;
  note: string | null;
  frequency: Frequency;
  start_date: string;
  next_date: string;
  end_date: string | null;
  account: { currency: string } | null;
};

/**
 * Creates every due occurrence of the user's recurring rules (through `today`) and
 * advances each rule's next_date. Safe to run concurrently: the unique
 * (recurring_id, txn_date) constraint drops duplicates.
 */
export async function materializeRecurring(supabase: SupabaseClient, userId: string, today: string) {
  const { data } = await supabase
    .from("recurring_transactions")
    .select("*, account:accounts (currency)")
    .eq("user_id", userId)
    .lte("next_date", today);
  const rules = (data || []) as unknown as Rule[];
  if (!rules.length) return 0;

  const [{ data: profile }, { rates }] = await Promise.all([
    supabase.from("profiles").select("base_currency").eq("id", userId).single(),
    getExchangeRates(),
  ]);
  const baseCurrency: string | null = profile?.base_currency ?? null;
  const now = new Date().toISOString();

  const rows: Record<string, unknown>[] = [];
  const advances: { id: string; next: string }[] = [];
  for (const rule of rules) {
    if (!rule.account) continue; // account no longer visible to this user
    const { dates, next } = dueOccurrences(rule, today);
    for (const txn_date of dates) {
      rows.push({
        user_id: userId,
        type: rule.type,
        account_id: rule.account_id,
        category_id: rule.category_id,
        amount: rule.amount,
        note: rule.note,
        txn_date,
        recurring_id: rule.id,
        client_created_at: now,
        synced_at: now,
        ...baseSnapshot(Number(rule.amount), rule.account.currency, baseCurrency, rates),
      });
    }
    advances.push({ id: rule.id, next });
  }

  if (rows.length) {
    const { error } = await supabase
      .from("transactions")
      .upsert(rows, { onConflict: "recurring_id,txn_date", ignoreDuplicates: true });
    if (error) {
      // Don't advance the rules, so the next request retries these dates.
      console.error("Failed to create recurring transactions:", error);
      return 0;
    }
  }
  await Promise.all(
    advances.map((a) => supabase.from("recurring_transactions").update({ next_date: a.next }).eq("id", a.id))
  );
  return rows.length;
}

/**
 * Once per request: bring recurring transactions up to date before a page reads data.
 * Pages and the layout render in parallel, so each data page awaits this itself.
 */
export const syncRecurring = cache(async () => {
  const user = await getAuthUser();
  if (!user) return 0;
  const supabase = await createClient();
  return materializeRecurring(supabase, user.id, await getToday());
});
