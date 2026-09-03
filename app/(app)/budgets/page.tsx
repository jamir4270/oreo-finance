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
  const { rates } = await getExchangeRates();

  // For each budget, ensure current period exists and compute actual spent
  const enrichedBudgets: BudgetCardData[] = [];

  if (budgets) {
    for (const budget of budgets) {
      const currentPeriod = await ensureCurrentPeriod(
        supabase,
        {
          id: budget.id,
          period_type: budget.period_type,
          start_date: budget.start_date,
          end_date: budget.end_date,
          limit_amount: budget.limit_amount,
        },
        userData.user.id
      );

      let computedSpent = 0;
      if (currentPeriod) {
        computedSpent = await computeActualSpent(
          supabase,
          userData.user.id,
          budget.category_id,
          currentPeriod.period_start,
          currentPeriod.period_end,
          baseCurrency,
          rates
        );

        // Also update the actual_spent snapshot on the period row (background, non-blocking)
        supabase
          .from("budget_periods")
          .update({ actual_spent: computedSpent })
          .eq("id", currentPeriod.id)
          .then(() => {});
      }

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
      <BudgetsPageClient
        budgets={enrichedBudgets}
        categories={categories || []}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
