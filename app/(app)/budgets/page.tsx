import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BudgetsPageClient } from "@/components/budgets/BudgetsPageClient";
import { getExchangeRates } from "@/lib/exchange-rates";
import { ensureCurrentPeriod, computeActualSpent } from "@/lib/budget-periods";
import { BudgetCardData } from "@/components/budgets/BudgetCard";

export default async function BudgetsPage() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    redirect("/login");
  }

  // Fetch user's base_currency from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("base_currency")
    .eq("id", userData.user.id)
    .single();

  const baseCurrency = profile?.base_currency || "USD";

  // Fetch all budgets with their category data
  const { data: budgets } = await supabase
    .from("budgets")
    .select(`
      *,
      category:categories (name, icon, txn_type)
    `)
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  // Fetch categories for the create dialog
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, icon, txn_type")
    .eq("user_id", userData.user.id)
    .order("name");

  // Fetch exchange rates
  const { rates, isStale } = await getExchangeRates();
  const { StaleRateBanner } = await import("@/components/ui/stale-rate-banner");
  const { ensureCurrentPeriods, computeActualSpentBatched } = await import("@/lib/budget-periods");

  const enrichedBudgets: BudgetCardData[] = [];

  if (budgets && budgets.length > 0) {
    const currentPeriods = await ensureCurrentPeriods(supabase, budgets, userData.user.id);

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
      userData.user.id,
      categoryPeriods,
      baseCurrency,
      rates
    );

    // Update the actual_spent snapshot on the period rows in background
    for (const cp of categoryPeriods) {
      const computedSpent = spentMap.get(cp.categoryId) || 0;
      supabase
        .from("budget_periods")
        .update({ actual_spent: computedSpent })
        .eq("id", cp.periodId)
        .then(() => {});
    }

    for (let i = 0; i < budgets.length; i++) {
      const budget = budgets[i];
      const currentPeriod = currentPeriods[i];
      const computedSpent = currentPeriod ? (spentMap.get(budget.category_id) || 0) : 0;

      enrichedBudgets.push({
        id: budget.id,
        category_id: budget.category_id,
        limit_amount: budget.limit_amount,
        period_type: budget.period_type,
        start_date: budget.start_date,
        end_date: budget.end_date,
        category: budget.category,
        currentPeriod,
        computedSpent,
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
