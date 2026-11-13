import { createClient, getAuthUser } from "@/lib/supabase/server";
import { syncRecurring } from "@/lib/recurring";
import { PageTransition } from "@/components/layout/page-transition";
import { getExchangeRates } from "@/lib/exchange-rates";
import { redirect } from "next/navigation";
import { AccountsPageClient } from "@/components/accounts/AccountsPageClient";

export default async function AccountsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  const supabase = await createClient();
  await syncRecurring(); // create any due recurring entries before reading

  const [{ data: profile }, { data: rawAccounts }, { data: balances }, { rates }] = await Promise.all([
    supabase.from("profiles").select("base_currency").eq("id", user.id).single(),
    // Accounts (active and archived)
    supabase
      .from("accounts")
      .select("id, name, type, currency, icon, archived_at")
      .eq("user_id", user.id)
      .order("name"),
    supabase.from("account_balances").select("account_id, balance, income, expense").eq("user_id", user.id),
    getExchangeRates(),
  ]);

  const balanceById = new Map((balances || []).map((b) => [b.account_id, b]));
  const accounts = (rawAccounts || []).map((account) => {
    const b = balanceById.get(account.id);
    return {
      ...account,
      balance: Number(b?.balance ?? 0),
      income: Number(b?.income ?? 0),
      expense: Number(b?.expense ?? 0),
    };
  });

  return (
    <PageTransition>
    <div className="flex flex-1 flex-col p-6 md:p-10 max-w-5xl mx-auto w-full">
      <AccountsPageClient 
        accounts={accounts} 
        baseCurrency={profile?.base_currency || "USD"} 
        rates={rates}
      />
    </div>
    </PageTransition>
  );
}
