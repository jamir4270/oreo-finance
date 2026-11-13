import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransactionsPageClient } from "@/components/transactions/TransactionsPageClient";
import { getExchangeRates } from "@/lib/exchange-rates";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Ids are interpolated into a PostgREST filter string, so anything else is dropped.
const idParam = (v: string | string[] | undefined) => (typeof v === "string" && UUID_RE.test(v) ? v : "all");

export default async function TransactionsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  const supabase = await createClient();

  // Parse search params
  const page = typeof searchParams.page === 'string' ? Math.max(1, parseInt(searchParams.page, 10) || 1) : 1;
  const filterType = typeof searchParams.type === 'string' ? searchParams.type : "all";
  const filterAccount = idParam(searchParams.account);
  const filterCategory = idParam(searchParams.category);
  const dateRange = typeof searchParams.dateRange === 'string' ? searchParams.dateRange : "all_time";

  const pageSize = 50;

  // Compute date range filters
  const today = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  
  if (dateRange === "last_30") {
    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
  } else if (dateRange === "this_month") {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (dateRange === "last_month") {
    startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    endDate = new Date(today.getFullYear(), today.getMonth(), 0);
  } else if (dateRange === "this_year") {
    startDate = new Date(today.getFullYear(), 0, 1);
  }

  // Build query
  let query = supabase
    .from("transactions")
    .select(`
      *,
      account:accounts!transactions_account_id_fkey (name, currency),
      to_account:accounts!transactions_to_account_id_fkey (name, currency),
      category:categories (name, icon, txn_type)
    `, { count: "exact" })
    .eq("user_id", user.id);

  if (filterType !== "all") {
    query = query.eq("type", filterType);
  }
  if (filterAccount !== "all") {
    query = query.or(`account_id.eq.${filterAccount},to_account_id.eq.${filterAccount}`);
  }
  if (filterCategory !== "all") {
    query = query.eq("category_id", filterCategory);
  }
  if (startDate) {
    query = query.gte("txn_date", startDate.toISOString().split('T')[0]);
  }
  if (endDate) {
    query = query.lte("txn_date", endDate.toISOString().split('T')[0]);
  }

  query = query
    .order("txn_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const [{ data: transactions, count }, { data: accounts }, { data: categories }, { rates, isStale }] = await Promise.all([
    query,
    // Accounts and categories for the dialog
    supabase.from("accounts").select("id, name, currency").eq("user_id", user.id).order("name"),
    supabase.from("categories").select("id, name, icon, txn_type").eq("user_id", user.id).order("name"),
    getExchangeRates(),
  ]);

  const totalPages = count ? Math.ceil(count / pageSize) : 1;
  const { StaleRateBanner } = await import("@/components/ui/stale-rate-banner");

  return (
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full">
      <StaleRateBanner isStale={isStale} />
      <TransactionsPageClient 
        transactions={transactions || []} 
        accounts={accounts || []}
        categories={categories || []}
        exchangeRates={rates}
        isStale={isStale}
        totalPages={totalPages}
        currentPage={page}
        initialFilters={{
          type: filterType,
          account: filterAccount,
          category: filterCategory,
          dateRange: dateRange
        }}
      />
    </div>
  );
}
