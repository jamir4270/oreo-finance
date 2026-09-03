"use client";

import * as React from "react";
import { AccountCard } from "./AccountCard";
import { AccountData, EditAccountDialog } from "./EditAccountDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateAccountDialog } from "./CreateAccountDialog";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

interface AccountsPageClientProps {
  accounts: (AccountData & { archived_at: string | null; income?: number; expense?: number })[];
  baseCurrency: string;
}

export function AccountsPageClient({ accounts, baseCurrency }: AccountsPageClientProps) {
  const [editingAccount, setEditingAccount] = React.useState<AccountData | null>(null);

  const activeAccounts = accounts.filter(a => !a.archived_at);
  const archivedAccounts = accounts.filter(a => a.archived_at);

  const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = activeAccounts.reduce((sum, acc) => sum + (acc.income || 0), 0);
  const totalExpense = activeAccounts.reduce((sum, acc) => sum + (acc.expense || 0), 0);

  const currencySymbol = React.useMemo(() => {
    try {
      const parts = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: baseCurrency,
        currencyDisplay: "narrowSymbol",
      }).formatToParts(0);
      return parts.find((p) => p.type === "currency")?.value || baseCurrency;
    } catch {
      return baseCurrency;
    }
  }, [baseCurrency]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-oreo-slate-purple">
            Accounts
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your financial accounts and balances.
          </p>
        </div>
        <CreateAccountDialog baseCurrency={baseCurrency} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-card" style={{ boxShadow: "0 4px 24px rgba(86, 86, 118, 0.04), 0 1px 4px rgba(86, 86, 118, 0.02)" }}>
          <CardContent className="p-4 sm:p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Total Balance</span>
            </div>
            <div className="font-mono text-lg sm:text-2xl font-semibold tracking-tight text-foreground truncate">
              {currencySymbol}{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-card" style={{ boxShadow: "0 4px 24px rgba(86, 86, 118, 0.04), 0 1px 4px rgba(86, 86, 118, 0.02)" }}>
          <CardContent className="p-4 sm:p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-oreo-dusty-teal mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Income</span>
            </div>
            <div className="font-mono text-lg sm:text-2xl font-semibold tracking-tight text-foreground truncate">
              {currencySymbol}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-card" style={{ boxShadow: "0 4px 24px rgba(86, 86, 118, 0.04), 0 1px 4px rgba(86, 86, 118, 0.02)" }}>
          <CardContent className="p-4 sm:p-6 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-oreo-mauve mb-1">
              <ArrowDownRight className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Expenses</span>
            </div>
            <div className="font-mono text-lg sm:text-2xl font-semibold tracking-tight text-foreground truncate">
              {currencySymbol}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex-1">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6 w-full sm:w-[400px] grid grid-cols-2">
            <TabsTrigger value="active">
              Active ({activeAccounts.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({archivedAccounts.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-0">
            {activeAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <p className="text-sm text-muted-foreground max-w-xs">
                  You don't have any active accounts. Click "Add Account" to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeAccounts.map((account) => (
                  <AccountCard 
                    key={account.id} 
                    account={account} 
                    onEdit={setEditingAccount} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="archived" className="mt-0">
            {archivedAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
                <p className="text-sm text-muted-foreground max-w-xs">
                  Archived accounts will appear here. They are hidden from regular views but keep their history.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedAccounts.map((account) => (
                  <AccountCard 
                    key={account.id} 
                    account={account} 
                    onEdit={setEditingAccount} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EditAccountDialog 
        account={editingAccount} 
        open={!!editingAccount} 
        onOpenChange={(open) => {
          if (!open) setEditingAccount(null);
        }} 
      />
    </>
  );
}
