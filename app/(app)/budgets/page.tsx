import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BudgetsPageClient } from "@/components/budgets/BudgetsPageClient";
import { getExchangeRates } from "@/lib/exchange-rates";
import { ensureCurrentPeriods, computeActualSpentBatched } from "@/lib/budget-periods";
import { StaleRateBanner } from "@/components/ui/stale-rate-banner";
import { convertCurrency } from "@/lib/currency";
import { BudgetCardData } from "@/components/budgets/BudgetCard";

export default async function BudgetsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  const supabase = await createClient();

  const [{ data: profile }, { data: budgets }, { data: categories }, { rates, isStale }] = await Promise.all([
    supabase.from("profiles").select("base_currency").eq("id", user.id).single(),
    // All budgets with their category data
    supabase
      .from("budgets")
      .select(`
        *,
        category:categories (name, icon, txn_type)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    // Categories for the create dialog
    supabase.from("categories").select("id, name, icon, txn_type").eq("user_id", user.id).order("name"),
    getExchangeRates(),
  ]);

  const baseCurrency = profile?.base_currency || "USD";

  const enrichedBudgets: BudgetCardData[] = [];

  if (budgets && budgets.length > 0) {
    const currentPeriods = await ensureCurrentPeriods(supabase, budgets, user.id);

    const categoryPeriods = currentPeriods.map((cp, idx) => {
      if (!cp) return null;
      return {
        categoryId: budgets[idx].category_id,
        periodStart: cp.period_start,
        periodEnd: cp.period_end,
        periodId: cp.id,
      };
    }).filter(Boolean) as any[];

    const spentMap = await computeActualSpentBatched(
      supabase,
      user.id,
      categoryPeriods,
      baseCurrency,
      rates
    );

    // Update the actual_spent snapshot on the period rows in background
    for (const cp of categoryPeriods) {
      const computedSpent = spentMap.get(cp.periodId) || 0;
      supabase
        .from("budget_periods")
        .update({ actual_spent: computedSpent })
        .eq("id", cp.periodId)
        .then(() => {});
    }

    for (let i = 0; i < budgets.length; i++) {
      const budget = budgets[i];
      const currentPeriod = currentPeriods[i];
      const computedSpent = currentPeriod ? (spentMap.get(currentPeriod.id) || 0) : 0;

      const budgetCurrency = budget.currency || baseCurrency;
      const convertedLimitAmount = convertCurrency(budget.limit_amount, budgetCurrency, baseCurrency, rates);
      let convertedEffectiveLimit = convertedLimitAmount;
      let convertedRolloverIn = 0;

      if (currentPeriod) {
        convertedEffectiveLimit = convertCurrency(currentPeriod.effective_limit, budgetCurrency, baseCurrency, rates);
        convertedRolloverIn = convertCurrency(currentPeriod.rollover_in, budgetCurrency, baseCurrency, rates);
      }

      enrichedBudgets.push({
        id: budget.id,
        category_id: budget.category_id,
        limit_amount: budget.limit_amount,
        period_type: budget.period_type,
        start_date: budget.start_date,
        end_date: budget.end_date,
        currency: budgetCurrency,
        category: budget.category,
        currentPeriod,
        computedSpent,
        convertedLimitAmount,
        convertedEffectiveLimit,
        convertedRolloverIn,
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full">
      <StaleRateBanner isStale={isStale} />
      <BudgetsPageClient
        budgets={enrichedBudgets}
        categories={categories || []}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
