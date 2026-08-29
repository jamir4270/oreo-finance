import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransactionsPageClient } from "@/components/transactions/TransactionsPageClient";
import { getExchangeRates } from "@/lib/exchange-rates";

export default async function TransactionsPage() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    redirect("/login");
  }

  // Fetch user's transactions with nested account and category data
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      account:accounts!transactions_account_id_fkey (name, currency),
      to_account:accounts!transactions_to_account_id_fkey (name, currency),
      category:categories (name, icon, txn_type)
    `)
    .eq("user_id", userData.user.id)
    .order("txn_date", { ascending: false })
    .order("created_at", { ascending: false });

  // Fetch accounts for the dialog
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, currency")
    .eq("user_id", userData.user.id)
    .order("name");

  // Fetch categories for the dialog
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, icon, txn_type")
    .eq("user_id", userData.user.id)
    .order("name");

  // Fetch exchange rates
  const { rates } = await getExchangeRates();

  return (
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full">
      <TransactionsPageClient 
        transactions={transactions || []} 
        accounts={accounts || []}
        categories={categories || []}
        exchangeRates={rates}
      />
    </div>
  );
}
