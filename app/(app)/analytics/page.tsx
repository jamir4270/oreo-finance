import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AnalyticsPageClient, AnalyticsTransaction, AnalyticsBudget, AnalyticsAccount } from "@/components/analytics/AnalyticsPageClient";
import { getExchangeRates } from "@/lib/exchange-rates";
import { convertCurrency } from "@/lib/currency";
import { ensureCurrentPeriod, computeActualSpent } from "@/lib/budget-periods";

export default async function AnalyticsPage() {
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

  // Fetch exchange rates
  const { rates } = await getExchangeRates();

  // Fetch Accounts
  const { data: accountsData } = await supabase
    .from("accounts")
    .select("id, name, currency")
    .eq("user_id", userData.user.id)
    .order("name");

  const accounts: AnalyticsAccount[] = accountsData || [];

  // Fetch Transactions (for the current year to keep payload reasonable, could be expanded if needed)
  const currentYearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const { data: transactionsData } = await supabase
    .from("transactions")
    .select(`
      id, type, amount, txn_date, category_id, account_id,
      account:accounts!transactions_account_id_fkey (currency),
      category:categories (name, icon, txn_type)
    `)
    .eq("user_id", userData.user.id)
    .gte("txn_date", currentYearStart)
    .order("txn_date", { ascending: false });

  // Map transactions and convert to base currency
  const transactions: AnalyticsTransaction[] = (transactionsData || []).map((t: any) => {
    const currency = t.account?.currency || baseCurrency;
    const convertedAmount = convertCurrency(t.amount, currency, baseCurrency, rates);
    return {
      id: t.id,
      type: t.type,
      amount: t.amount,
      txn_date: t.txn_date,
      category_id: t.category_id,
      account_id: t.account_id,
      category: t.category,
      convertedAmount,
    };
  });

  // Fetch Budgets
  const { data: budgetsData } = await supabase
    .from("budgets")
    .select(`
      *,
      category:categories (name, icon, txn_type)
    `)
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  const budgets: AnalyticsBudget[] = [];

  if (budgetsData) {
    for (const budget of budgetsData) {
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
      }

      budgets.push({
        id: budget.id,
        category_id: budget.category_id,
        limit_amount: budget.limit_amount,
        period_type: budget.period_type,
        category: budget.category,
        currentPeriod,
        computedSpent,
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8 lg:p-10 max-w-5xl mx-auto w-full">
      <AnalyticsPageClient
        transactions={transactions}
        budgets={budgets}
        accounts={accounts}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
