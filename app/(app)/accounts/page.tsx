import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountsPageClient } from "@/components/accounts/AccountsPageClient";

export default async function AccountsPage() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    redirect("/login");
  }

  // Fetch user's profile for base currency
  const { data: profile } = await supabase
    .from("profiles")
    .select("base_currency")
    .eq("id", userData.user.id)
    .single();

  // Fetch accounts (active and archived) along with their transactions
  const { data: rawAccounts } = await supabase
    .from("accounts")
    .select(`
      id, name, type, currency, icon, archived_at, 
      outgoing_transactions:transactions!transactions_account_id_fkey(amount, type),
      incoming_transfers:transactions!transactions_to_account_id_fkey(to_amount, type)
    `)
    .eq("user_id", userData.user.id)
    .order("name");

  // Calculate balances
  const accounts = (rawAccounts || []).map((account: any) => {
    let balance = 0;
    let income = 0;
    let expense = 0;
    
    // Process outgoing (income adds, expense/transfer subtracts)
    if (account.outgoing_transactions) {
      account.outgoing_transactions.forEach((txn: any) => {
        if (txn.type === "income") {
          const amt = Number(txn.amount);
          balance += amt;
          income += amt;
        } else if (txn.type === "expense") {
          const amt = Number(txn.amount);
          balance -= amt;
          expense += amt;
        } else if (txn.type === "transfer") {
          balance -= Number(txn.amount);
        }
      });
    }
    
    // Process incoming transfers (adds to_amount)
    if (account.incoming_transfers) {
      account.incoming_transfers.forEach((txn: any) => {
        if (txn.type === "transfer" && txn.to_amount) {
          balance += Number(txn.to_amount);
        }
      });
    }
    
    return {
      id: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      icon: account.icon,
      archived_at: account.archived_at,
      balance,
      income,
      expense
    };
  });

  const { getExchangeRates } = await import("@/lib/exchange-rates");
  const { rates } = await getExchangeRates();

  return (
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full">
      <AccountsPageClient 
        accounts={accounts} 
        baseCurrency={profile?.base_currency || "USD"} 
        rates={rates}
      />
    </div>
  );
}
