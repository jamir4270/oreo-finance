import { createClient, getAuthUser } from "@/lib/supabase/server";
import { syncRecurring } from "@/lib/recurring";
import { getToday } from "@/lib/today";
import { dateRangeBounds } from "@/lib/dates";
import { PageTransition } from "@/components/layout/page-transition";
import { redirect } from "next/navigation";
import { AnalyticsPageClient, AnalyticsTransaction, AnalyticsBudget, AnalyticsAccount } from "@/components/analytics/AnalyticsPageClient";
import { getExchangeRates } from "@/lib/exchange-rates";
import { amountIn } from "@/lib/currency";
import { loadCurrentBudgets } from "@/lib/budget-periods";
import { StaleRateBanner } from "@/components/ui/stale-rate-banner";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  const supabase = await createClient();
  await syncRecurring(); // create any due recurring entries before reading

  // Await searchParams in Next.js 15+
  const resolvedParams = await searchParams;
  const dateRange = (resolvedParams.dateRange as string) || "last_30";
  const accountFilter = (resolvedParams.account as string) || "all";

  // Determine date bounds
  const today = await getToday();
  const startDate = dateRangeBounds(dateRange, today).start ?? "1970-01-01";

  const [{ data: profile }, { rates, isStale }, { data: accountsData }, { data: transactionsData }, { data: budgetsData }] = await Promise.all([
    supabase.from("profiles").select("base_currency").eq("id", user.id).single(),
    getExchangeRates(),
    supabase.from("accounts").select("id, name, currency").eq("user_id", user.id).order("name"),
    // Only the start is bounded; the client slices the exact range (e.g. last_month).
    supabase
      .from("transactions")
      .select(`
        id, type, amount, base_amount, base_currency, txn_date, category_id, account_id,
        account:accounts!transactions_account_id_fkey (currency),
        category:categories (name, icon, txn_type)
      `)
      .eq("user_id", user.id)
      .gte("txn_date", startDate)
      .order("txn_date", { ascending: false }),
    supabase
      .from("budgets")
      .select(`
        *,
        category:categories (name, icon, txn_type)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const baseCurrency = profile?.base_currency || "USD";
  const accounts: AnalyticsAccount[] = accountsData || [];

  // Map transactions and convert to base currency
  const transactions: AnalyticsTransaction[] = (transactionsData || []).map((t: any) => {
    const convertedAmount = amountIn(t, baseCurrency, rates);
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

  const budgets: AnalyticsBudget[] = [];

  if (budgetsData && budgetsData.length > 0) {
    const loaded = await loadCurrentBudgets(supabase, user.id, budgetsData, baseCurrency, rates, today);

    for (const { budget, period: currentPeriod, spent: computedSpent } of loaded) {

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
    <PageTransition>
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
    </PageTransition>
  );
}
