import { SupabaseClient } from "@supabase/supabase-js";
import { amountIn, tryConvertCurrency } from "@/lib/currency";
import { addDays, daysBetween } from "@/lib/dates";

interface BudgetLike {
  period_type: string;
  start_date: string;
  end_date: string | null;
}

/**
 * Compute the period_start and period_end for the period that covers `referenceDay`
 * ("YYYY-MM-DD" in the user's time zone, see lib/today.ts), given the budget's
 * period_type and anchor start_date.
 */
export function computePeriodBounds(
  budget: BudgetLike,
  referenceDay: string
): { periodStart: string; periodEnd: string } {
  const anchor = new Date(budget.start_date + "T00:00:00");
  const ref = new Date(referenceDay + "T00:00:00");

  if (budget.period_type === "custom") {
    // Custom periods are fixed: start_date → end_date, no repetition
    return {
      periodStart: budget.start_date,
      periodEnd: budget.end_date!,
    };
  }

  if (budget.period_type === "daily") {
    // 1-day windows anchored from start_date
    const diffMs = ref.getTime() - anchor.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const periodStartDate = new Date(anchor);
    periodStartDate.setDate(periodStartDate.getDate() + diffDays);
    const periodEndDate = new Date(periodStartDate);
    
    return {
      periodStart: toDateString(periodStartDate),
      periodEnd: toDateString(periodEndDate),
    };
  }

  if (budget.period_type === "weekly") {
    // 7-day windows anchored from start_date
    const diffMs = ref.getTime() - anchor.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const periodIndex = Math.floor(diffDays / 7);
    const periodStartDate = new Date(anchor);
    periodStartDate.setDate(periodStartDate.getDate() + periodIndex * 7);
    const periodEndDate = new Date(periodStartDate);
    periodEndDate.setDate(periodEndDate.getDate() + 6);

    return {
      periodStart: toDateString(periodStartDate),
      periodEnd: toDateString(periodEndDate),
    };
  }

  // Monthly: periods start on the anchor's day-of-month, clamped to short months
  // (anchor 31 → Feb 28/29), and end the day before the next period starts.
  const anchorDay = anchor.getDate();
  // Clamp before constructing: new Date(y, m, 31) in a 30-day month overflows into the next month.
  const monthStart = (y: number, m: number) =>
    new Date(y, m, Math.min(anchorDay, new Date(y, m + 1, 0).getDate()));

  let periodStartDate = monthStart(ref.getFullYear(), ref.getMonth());
  if (periodStartDate > ref) {
    periodStartDate = monthStart(ref.getFullYear(), ref.getMonth() - 1);
  }

  const periodEndDate = monthStart(periodStartDate.getFullYear(), periodStartDate.getMonth() + 1);
  periodEndDate.setDate(periodEndDate.getDate() - 1);

  return {
    periodStart: toDateString(periodStartDate),
    periodEnd: toDateString(periodEndDate),
  };
}

function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type PeriodBounds = { periodStart: string; periodEnd: string };
type PeriodRow = { id: string; budget_id: string; period_start: string; period_end: string; effective_limit: number; actual_spent: number };

// A year of daily periods; beyond that, older history no longer affects the rollover.
const MAX_BACKFILL = 400;

/**
 * Periods to create so the chain has no gaps: from the one after `lastPeriodEnd` through
 * the period containing `today`. With no stored period (or a custom budget), just the
 * current one.
 */
export function periodsToCreate(budget: BudgetLike, lastPeriodEnd: string | null, today: string): PeriodBounds[] {
  const current = computePeriodBounds(budget, today);
  if (!lastPeriodEnd || budget.period_type === "custom" || lastPeriodEnd >= current.periodStart) {
    return [current];
  }
  const periods: PeriodBounds[] = [];
  for (let day = addDays(lastPeriodEnd, 1); day <= current.periodStart; ) {
    const p = computePeriodBounds(budget, day);
    periods.push(p);
    day = addDays(p.periodEnd, 1);
  }
  return periods.slice(-MAX_BACKFILL);
}

/**
 * Carries rollover through consecutive periods: each one starts with
 * base_limit + (previous effective_limit − previous spent).
 * `spent` has one entry per period except the last (the current, still-open one).
 */
export function chainRollover(
  baseLimit: number,
  initialRollover: number,
  periods: PeriodBounds[],
  spent: number[]
) {
  let rollover = initialRollover;
  return periods.map((p, i) => {
    const effective = baseLimit + rollover;
    const actual = i < periods.length - 1 ? spent[i] : 0;
    const row = { period_start: p.periodStart, period_end: p.periodEnd, base_limit: baseLimit, rollover_in: rollover, effective_limit: effective, actual_spent: actual };
    rollover = effective - actual;
    return row;
  });
}

/**
 * Returns the current budget_periods row for each budget, creating it when missing.
 * When a new period starts, the previous one is finalized from its real transactions
 * (in the budget's own currency) and any skipped periods are backfilled, so rollover
 * never depends on someone having opened the budgets page.
 * shortcut: a transaction backdated into an already-finalized period doesn't re-flow the
 * chain; recompute downstream periods on transaction writes if that matters.
 */
export async function ensureCurrentPeriods(
  supabase: SupabaseClient,
  budgets: {
    id: string;
    period_type: string;
    start_date: string;
    end_date: string | null;
    limit_amount: number;
    category_id: string;
    currency: string;
  }[],
  userId: string,
  today: string,
  rates: Record<string, number>
) {
  if (!budgets.length) return [];

  const current = new Map(budgets.map((b) => [b.id, computePeriodBounds(b, today)]));
  const currentFilter = budgets
    .map((b) => `and(budget_id.eq.${b.id},period_start.eq.${current.get(b.id)!.periodStart})`)
    .join(",");
  const fetchCurrent = async () => {
    const { data } = await supabase.from("budget_periods").select("*").or(currentFilter);
    return new Map((data || []).map((p) => [p.budget_id, p]));
  };

  const existing = await fetchCurrent();
  const missing = budgets.filter((b) => !existing.has(b.id));
  if (!missing.length) return budgets.map((b) => existing.get(b.id));

  // Latest stored period before the current one, per budget
  const { data: priorRows } = await supabase
    .from("budget_periods")
    .select("*")
    .in("budget_id", missing.map((b) => b.id))
    .order("period_start", { ascending: false });
  const last = new Map<string, PeriodRow>();
  for (const p of (priorRows || []) as PeriodRow[]) {
    if (!last.has(p.budget_id) && p.period_start < current.get(p.budget_id)!.periodStart) last.set(p.budget_id, p);
  }

  const plans = missing.map((b) => ({ budget: b, last: last.get(b.id), periods: periodsToCreate(b, last.get(b.id)?.period_end ?? null, today) }));

  // Windows whose spending gets finalized: the last stored period + every backfilled one
  const windows = plans.flatMap(({ budget, last, periods }) => [
    ...(last ? [{ budget, start: last.period_start, end: last.period_end }] : []),
    ...periods.slice(0, -1).map((p) => ({ budget, start: p.periodStart, end: p.periodEnd })),
  ]);

  let txns: { amount: number; base_amount: number | null; base_currency: string | null; category_id: string; txn_date: string; account: { currency: string } | null }[] = [];
  if (windows.length) {
    const { data } = await supabase
      .from("transactions")
      .select("amount, base_amount, base_currency, category_id, txn_date, account:accounts!transactions_account_id_fkey (currency)")
      .eq("user_id", userId)
      .eq("type", "expense")
      .in("category_id", [...new Set(windows.map((w) => w.budget.category_id))])
      .gte("txn_date", windows.reduce((m, w) => (w.start < m ? w.start : m), windows[0].start))
      .lte("txn_date", windows.reduce((m, w) => (w.end > m ? w.end : m), windows[0].end));
    txns = (data as unknown as typeof txns) || [];
  }

  // Spend in the budget's currency; null if a needed rate is missing
  const spentIn = (budget: (typeof budgets)[number], start: string, end: string): number | null => {
    let total = 0;
    for (const t of txns) {
      if (t.category_id !== budget.category_id || t.txn_date < start || t.txn_date > end) continue;
      const converted =
        t.base_amount != null && t.base_currency === budget.currency
          ? Number(t.base_amount)
          : tryConvertCurrency(Number(t.amount), t.account?.currency || budget.currency, budget.currency, rates);
      if (converted === null) return null;
      total += converted;
    }
    return total;
  };

  const rows: Record<string, unknown>[] = [];
  for (const { budget, last, periods } of plans) {
    const limit = Number(budget.limit_amount);
    const lastSpent = last ? spentIn(budget, last.period_start, last.period_end) : 0;
    const gapSpent = periods.slice(0, -1).map((p) => spentIn(budget, p.periodStart, p.periodEnd));

    if (lastSpent === null || gapSpent.includes(null)) {
      // Rates unavailable: create only the current period from the stored snapshot rather
      // than finalize history with mixed-currency totals. It is corrected next time a period
      // starts with rates available.
      const rollover = last ? Number(last.effective_limit) - Number(last.actual_spent) : 0;
      rows.push({ user_id: userId, budget_id: budget.id, ...chainRollover(limit, rollover, [periods[periods.length - 1]], [])[0] });
      continue;
    }

    if (last) {
      await supabase.from("budget_periods").update({ actual_spent: lastSpent }).eq("id", last.id);
    }
    const rollover = last ? Number(last.effective_limit) - (lastSpent as number) : 0;
    for (const row of chainRollover(limit, rollover, periods, gapSpent as number[])) {
      rows.push({ user_id: userId, budget_id: budget.id, ...row });
    }
  }

  // Concurrent requests may create the same period; the unique (budget_id, period_start) wins.
  const { error } = await supabase
    .from("budget_periods")
    .upsert(rows, { onConflict: "budget_id,period_start", ignoreDuplicates: true });
  if (error) console.error("Failed to create budget periods:", error);

  const after = await fetchCurrent();
  return budgets.map((b) => after.get(b.id));
}

export async function computeActualSpentBatched(
  supabase: SupabaseClient,
  userId: string,
  categoryPeriods: { categoryId: string; periodStart: string; periodEnd: string; periodId: string }[],
  baseCurrency: string,
  rates: Record<string, number>
): Promise<Map<string, number>> {
  if (!categoryPeriods.length) return new Map<string, number>();

  const minStart = categoryPeriods.reduce((min, p) => p.periodStart < min ? p.periodStart : min, categoryPeriods[0].periodStart);
  const maxEnd = categoryPeriods.reduce((max, p) => p.periodEnd > max ? p.periodEnd : max, categoryPeriods[0].periodEnd);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, base_amount, base_currency, category_id, txn_date, account:accounts!transactions_account_id_fkey (currency)")
    .eq("user_id", userId)
    .eq("type", "expense")
    .gte("txn_date", minStart)
    .lte("txn_date", maxEnd)
    .in("category_id", categoryPeriods.map(c => c.categoryId));

  // Keyed by periodId: two budgets on the same category must not share a total.
  const spentMap = new Map<string, number>();
  for (const cp of categoryPeriods) {
    spentMap.set(cp.periodId, 0);
  }

  if (transactions) {
    for (const txn of transactions) {
      const converted = amountIn(txn as Parameters<typeof amountIn>[0], baseCurrency, rates);
      for (const cp of categoryPeriods) {
        if (cp.categoryId === txn.category_id && txn.txn_date >= cp.periodStart && txn.txn_date <= cp.periodEnd) {
          spentMap.set(cp.periodId, spentMap.get(cp.periodId)! + converted);
        }
      }
    }
  }

  return spentMap;
}

type BudgetRow = Parameters<typeof ensureCurrentPeriods>[1][number];

/**
 * Current period + spend so far (in the base currency) for each budget. Shared by the
 * dashboard, budgets and analytics pages.
 */
export async function loadCurrentBudgets<B extends BudgetRow>(
  supabase: SupabaseClient,
  userId: string,
  budgets: B[],
  baseCurrency: string,
  rates: Record<string, number>,
  today: string
) {
  if (!budgets.length) return [];
  const periods = await ensureCurrentPeriods(supabase, budgets, userId, today, rates);
  const categoryPeriods = periods.flatMap((p, i) =>
    p ? [{ categoryId: budgets[i].category_id, periodStart: p.period_start, periodEnd: p.period_end, periodId: p.id }] : []
  );
  const spent = await computeActualSpentBatched(supabase, userId, categoryPeriods, baseCurrency, rates);
  return budgets.map((budget, i) => ({
    budget,
    period: periods[i],
    spent: periods[i] ? spent.get(periods[i].id) ?? 0 : 0,
  }));
}

/**
 * "Safe to spend today": for each budget, what's left this period spread over the days
 * left in it (today included), summed. Overspent budgets add nothing and are counted;
 * periods that already ended (custom budgets) are ignored.
 */
export function safeToSpend(items: { remaining: number; periodEnd: string }[], today: string) {
  let perDay = 0;
  let left = 0;
  let overspent = 0;
  let active = 0;
  for (const { remaining, periodEnd } of items) {
    const daysLeft = daysBetween(today, periodEnd) + 1;
    if (daysLeft <= 0) continue;
    active++;
    if (remaining <= 0) {
      overspent++;
      continue;
    }
    left += remaining;
    perDay += remaining / daysLeft;
  }
  return { perDay, left, overspent, active };
}
