import { SupabaseClient } from "@supabase/supabase-js";
import { convertCurrency } from "@/lib/currency";

interface BudgetLike {
  period_type: string;
  start_date: string;
  end_date: string | null;
}

/**
 * Compute the period_start and period_end for the period that covers `referenceDate`,
 * given the budget's period_type and anchor start_date.
 */
export function computePeriodBounds(
  budget: BudgetLike,
  referenceDate: Date
): { periodStart: string; periodEnd: string } {
  const anchor = new Date(budget.start_date + "T00:00:00");
  const ref = new Date(referenceDate.toISOString().split("T")[0] + "T00:00:00");

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

export async function ensureCurrentPeriods(
  supabase: SupabaseClient,
  budgets: {
    id: string;
    period_type: string;
    start_date: string;
    end_date: string | null;
    limit_amount: number;
    category_id: string;
  }[],
  userId: string
) {
  if (!budgets.length) return [];

  const today = new Date();
  const bounds = budgets.map((b) => ({
    budget_id: b.id,
    ...computePeriodBounds(b, today),
  }));

  // Construct OR query for existing periods
  const orFilters = bounds
    .map((b) => `and(budget_id.eq.${b.budget_id},period_start.eq.${b.periodStart})`)
    .join(",");
  
  const { data: existingPeriods } = await supabase
    .from("budget_periods")
    .select("*")
    .or(orFilters);

  const existingMap = new Map((existingPeriods || []).map((p) => [p.budget_id, p]));
  
  const missingBudgets = budgets.filter((b) => !existingMap.has(b.id));

  const newPeriodsToInsert = [];
  
  if (missingBudgets.length > 0) {
    // Fetch prior periods for rollover
    const { data: allPriorPeriods } = await supabase
      .from("budget_periods")
      .select("*")
      .in("budget_id", missingBudgets.map(b => b.id))
      .order("period_start", { ascending: false });

    for (const budget of missingBudgets) {
      const bound = bounds.find(b => b.budget_id === budget.id)!;
      const priorPeriod = (allPriorPeriods || []).find(
        (p) => p.budget_id === budget.id && p.period_start < bound.periodStart
      );

      let rolloverIn = 0;
      if (priorPeriod) {
        rolloverIn = priorPeriod.effective_limit - priorPeriod.actual_spent;
      }

      newPeriodsToInsert.push({
        user_id: userId,
        budget_id: budget.id,
        period_start: bound.periodStart,
        period_end: bound.periodEnd,
        base_limit: budget.limit_amount,
        rollover_in: rolloverIn,
        effective_limit: budget.limit_amount + rolloverIn,
        actual_spent: 0,
      });
    }

    if (newPeriodsToInsert.length > 0) {
      const { data: insertedPeriods } = await supabase
        .from("budget_periods")
        .insert(newPeriodsToInsert)
        .select();
      
      if (insertedPeriods) {
        insertedPeriods.forEach(p => existingMap.set(p.budget_id, p));
      }
    }
  }

  return budgets.map((b) => existingMap.get(b.id));
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
    .select("amount, category_id, txn_date, account:accounts!transactions_account_id_fkey (currency)")
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
      const txnCurrency = (txn.account as any)?.currency || baseCurrency;
      const converted = convertCurrency(txn.amount, txnCurrency, baseCurrency, rates);
      for (const cp of categoryPeriods) {
        if (cp.categoryId === txn.category_id && txn.txn_date >= cp.periodStart && txn.txn_date <= cp.periodEnd) {
          spentMap.set(cp.periodId, spentMap.get(cp.periodId)! + converted);
        }
      }
    }
  }

  return spentMap;
}
