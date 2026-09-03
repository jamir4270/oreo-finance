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

  // Monthly: calendar-month windows anchored from start_date day-of-month
  const anchorDay = anchor.getDate();

  // Find which monthly period covers the reference date
  // Period N starts on anchorDay of some month, ends on (anchorDay - 1) of next month
  let periodStartDate = new Date(ref.getFullYear(), ref.getMonth(), anchorDay);
  if (periodStartDate > ref) {
    // Go back one month
    periodStartDate = new Date(ref.getFullYear(), ref.getMonth() - 1, anchorDay);
  }

  // Clamp if the day doesn't exist in that month (e.g. anchor day 31 in Feb)
  const maxDaysInMonth = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth() + 1, 0).getDate();
  if (anchorDay > maxDaysInMonth) {
    periodStartDate.setDate(maxDaysInMonth);
  }

  const periodEndDate = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth() + 1, anchorDay - 1);
  const maxDaysInNextMonth = new Date(periodEndDate.getFullYear(), periodEndDate.getMonth() + 1, 0).getDate();
  if (anchorDay - 1 > maxDaysInNextMonth) {
    periodEndDate.setDate(maxDaysInNextMonth);
  }

  return {
    periodStart: toDateString(periodStartDate),
    periodEnd: toDateString(periodEndDate),
  };
}

/**
 * Lazily ensures a budget_periods row exists for the current period.
 * If one doesn't exist, it creates one with rollover from the prior period.
 * Returns the current period row.
 */
export async function ensureCurrentPeriod(
  supabase: SupabaseClient,
  budget: {
    id: string;
    period_type: string;
    start_date: string;
    end_date: string | null;
    limit_amount: number;
  },
  userId: string
) {
  const today = new Date();
  const { periodStart, periodEnd } = computePeriodBounds(budget, today);

  // Check if a period already exists for this range
  const { data: existingPeriod } = await supabase
    .from("budget_periods")
    .select("*")
    .eq("budget_id", budget.id)
    .eq("period_start", periodStart)
    .single();

  if (existingPeriod) {
    return existingPeriod;
  }

  // Find the most recent prior period for rollover calculation
  let rolloverIn = 0;
  const { data: priorPeriod } = await supabase
    .from("budget_periods")
    .select("*")
    .eq("budget_id", budget.id)
    .lt("period_start", periodStart)
    .order("period_start", { ascending: false })
    .limit(1)
    .single();

  if (priorPeriod) {
    // Rollover = effective_limit - actual_spent (surplus is positive, deficit is negative)
    rolloverIn = priorPeriod.effective_limit - priorPeriod.actual_spent;
  }

  const effectiveLimit = budget.limit_amount + rolloverIn;

  const { data: newPeriod, error } = await supabase
    .from("budget_periods")
    .insert({
      user_id: userId,
      budget_id: budget.id,
      period_start: periodStart,
      period_end: periodEnd,
      base_limit: budget.limit_amount,
      rollover_in: rolloverIn,
      effective_limit: effectiveLimit,
      actual_spent: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create budget period:", error);
    return null;
  }

  return newPeriod;
}

/**
 * Compute actual spending for a category within a date range,
 * converting all transaction amounts to the user's base currency.
 */
export async function computeActualSpent(
  supabase: SupabaseClient,
  userId: string,
  categoryId: string,
  periodStart: string,
  periodEnd: string,
  baseCurrency: string,
  rates: Record<string, number>
): Promise<number> {
  // Fetch all expense transactions for this category in the period range
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, account:accounts!transactions_account_id_fkey (currency)")
    .eq("user_id", userId)
    .eq("category_id", categoryId)
    .eq("type", "expense")
    .gte("txn_date", periodStart)
    .lte("txn_date", periodEnd);

  if (!transactions || transactions.length === 0) {
    return 0;
  }

  let total = 0;
  for (const txn of transactions) {
    const txnCurrency = (txn.account as any)?.currency || baseCurrency;
    total += convertCurrency(txn.amount, txnCurrency, baseCurrency, rates);
  }

  return total;
}

function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
