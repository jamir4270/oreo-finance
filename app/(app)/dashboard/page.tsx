import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Mascot } from "@/components/ui/mascot";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("base_currency")
    .eq("id", user.id)
    .single();

  const currencySymbol = profile?.base_currency === "USD" ? "$" : 
                         profile?.base_currency === "EUR" ? "€" :
                         profile?.base_currency === "GBP" ? "£" :
                         profile?.base_currency === "PHP" ? "₱" :
                         profile?.base_currency;

  const { data: rawAccounts } = await supabase
    .from("accounts")
    .select(`
      *,
      outgoing_transactions:transactions!transactions_account_id_fkey(amount, type),
      incoming_transfers:transactions!transactions_to_account_id_fkey(to_amount, type)
    `)
    .eq("user_id", user.id);

  const allAccounts = (rawAccounts || []).map((account: any) => {
    let balance = 0;
    if (account.outgoing_transactions) {
      account.outgoing_transactions.forEach((txn: any) => {
        if (txn.type === "income") balance += Number(txn.amount);
        else if (txn.type === "expense") balance -= Number(txn.amount);
        else if (txn.type === "transfer") balance -= Number(txn.amount);
      });
    }
    if (account.incoming_transfers) {
      account.incoming_transfers.forEach((txn: any) => {
        if (txn.type === "transfer" && txn.to_amount) balance += Number(txn.to_amount);
      });
    }
    return { ...account, balance };
  });

  const activeAccounts = (allAccounts || []).filter(a => !a.archived_at);
  const accounts = [...activeAccounts].sort((a, b) => b.balance - a.balance).slice(0, 3);

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      category:categories(name, icon)
    `)
    .eq("user_id", user.id)
    .order("txn_date", { ascending: false })
    .limit(5);

  const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-5xl mx-auto w-full">
      {/* Header & Balance */}
      <div className="flex flex-col items-center text-center gap-2 mt-4 md:mt-8">
        <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Total Balance
        </span>
        <h1 className="font-mono text-5xl md:text-7xl font-semibold tracking-tight text-oreo-slate-purple">
          <AnimatedCounter value={totalBalance} prefix={currencySymbol} />
        </h1>
      </div>

      {(!accounts?.length && !transactions?.length) ? (
        <Card
          className="w-full border-0 mt-8"
          style={{
            boxShadow:
              "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
          }}
        >
          <CardContent className="flex flex-col items-center gap-4 pt-10 pb-10 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-oreo-lavender/50">
              <Mascot pose="idle" className="h-16 w-16" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h2 className="font-heading text-2xl font-semibold text-oreo-slate-purple">
                Welcome to Oreo!
              </h2>
              <p className="text-sm text-muted-foreground">
                You&apos;re all set up. Once you add your first account and log some transactions, they&apos;ll show up here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Accounts Summary */}
          <Card className="border-0 shadow-sm flex flex-col" style={{ boxShadow: "0 4px 24px rgba(86, 86, 118, 0.04)" }}>
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-xl text-oreo-slate-purple">Your Accounts</CardTitle>
              <Link href="/accounts" className="text-sm font-medium text-oreo-dusty-teal flex items-center hover:underline">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {accounts?.length ? accounts.map((acc) => {
                const Icon = acc.icon ? (LucideIcons as any)[acc.icon] : LucideIcons.Wallet;
                return (
                  <div key={acc.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-oreo-lavender/50 text-oreo-slate-purple">
                        {Icon && <Icon className="h-5 w-5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{acc.name}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">{acc.type.replace("_", " ")}</span>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-semibold">{acc.currency} {acc.balance.toFixed(2)}</span>
                  </div>
                );
              }) : (
                <div className="text-sm text-muted-foreground text-center py-4">No accounts found.</div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm flex flex-col" style={{ boxShadow: "0 4px 24px rgba(86, 86, 118, 0.04)" }}>
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-xl text-oreo-slate-purple">Recent Activity</CardTitle>
              <Link href="/transactions" className="text-sm font-medium text-oreo-dusty-teal flex items-center hover:underline">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {transactions?.length ? transactions.map((txn) => {
                const isExpense = txn.type === "expense";
                const catIcon = txn.category?.icon || "Tag";
                const Icon = (LucideIcons as any)[catIcon] || LucideIcons.Tag;
                return (
                  <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{txn.category?.name || "Uncategorized"}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(txn.txn_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`font-mono text-sm font-semibold ${isExpense ? "text-oreo-mauve" : "text-oreo-dusty-teal"}`}>
                      {isExpense ? "-" : "+"}{currencySymbol}{txn.amount.toFixed(2)}
                    </span>
                  </div>
                );
              }) : (
                <div className="text-sm text-muted-foreground text-center py-4">No transactions yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
