import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AnalyticsPageClient, AnalyticsTransaction, AnalyticsBudget, AnalyticsAccount } from "@/components/analytics/AnalyticsPageClient";
import { getExchangeRates } from "@/lib/exchange-rates";
import { convertCurrency } from "@/lib/currency";
import { ensureCurrentPeriod, computeActualSpent } from "@/lib/budget-periods";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    redirect("/login");
  }

  // Await searchParams in Next.js 15+
  const resolvedParams = await searchParams;
  const dateRange = (resolvedParams.dateRange as string) || "last_30";
  const accountFilter = (resolvedParams.account as string) || "all";

  // Fetch user's base_currency from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("base_currency")
    .eq("id", userData.user.id)
    .single();

  const baseCurrency = profile?.base_currency || "USD";

  // Fetch exchange rates
  const { rates, isStale } = await getExchangeRates();
  const { StaleRateBanner } = await import("@/components/ui/stale-rate-banner");

  // Fetch Accounts
  const { data: accountsData } = await supabase
    .from("accounts")
    .select("id, name, currency")
    .eq("user_id", userData.user.id)
    .order("name");

  const accounts: AnalyticsAccount[] = accountsData || [];

  // Determine date bounds
  const today = new Date();
  let startDate = new Date(0); // far past
  if (dateRange === "last_30") {
    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
  } else if (dateRange === "this_month") {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (dateRange === "last_month") {
    startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  } else if (dateRange === "this_year") {
    startDate = new Date(today.getFullYear(), 0, 1);
  }

  // Let's only bound the minimum date for the query to save DB overhead. 
  // We fetch a bit more for last_month since we just bound the start, the client handles the exact slice.
  const { data: transactionsData } = await supabase
    .from("transactions")
    .select(`
      id, type, amount, txn_date, category_id, account_id,
      account:accounts!transactions_account_id_fkey (currency),
      category:categories (name, icon, txn_type)
    `)
    .eq("user_id", userData.user.id)
    .gte("txn_date", startDate.toISOString())
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
  const { ensureCurrentPeriods, computeActualSpentBatched } = await import("@/lib/budget-periods");

  if (budgetsData && budgetsData.length > 0) {
    const currentPeriods = await ensureCurrentPeriods(supabase, budgetsData, userData.user.id);

    const categoryPeriods = currentPeriods.map((cp, idx) => {
      if (!cp) return null;
      return {
        categoryId: budgetsData[idx].category_id,
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

    for (let i = 0; i < budgetsData.length; i++) {
      const budget = budgetsData[i];
      const currentPeriod = currentPeriods[i];
      const computedSpent = currentPeriod ? (spentMap.get(budget.category_id) || 0) : 0;

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
      <StaleRateBanner isStale={isStale} />
      <AnalyticsPageClient
        transactions={transactions}
        budgets={budgets}
        accounts={accounts}
        baseCurrency={baseCurrency}
        initialDateRange={dateRange}
        initialAccountFilter={accountFilter}
      />
    </div>
  );
}
