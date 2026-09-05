"use client";

import * as React from "react";
import { AccountCard } from "./AccountCard";
import { AccountData, EditAccountDialog } from "./EditAccountDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateAccountDialog } from "./CreateAccountDialog";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { convertCurrency, getCurrencySymbol } from "@/lib/currency";

interface AccountsPageClientProps {
  accounts: (AccountData & { archived_at: string | null; income?: number; expense?: number })[];
  baseCurrency: string;
  rates: Record<string, number>;
}

export function AccountsPageClient({ accounts, baseCurrency, rates }: AccountsPageClientProps) {
  const [editingAccount, setEditingAccount] = React.useState<AccountData | null>(null);

  const activeAccounts = accounts.filter(a => !a.archived_at);
  const archivedAccounts = accounts.filter(a => a.archived_at);

  const totalBalance = activeAccounts.reduce((sum, acc) => sum + convertCurrency(acc.balance, acc.currency, baseCurrency, rates), 0);
  const totalIncome = activeAccounts.reduce((sum, acc) => sum + convertCurrency(acc.income || 0, acc.currency, baseCurrency, rates), 0);
  const totalExpense = activeAccounts.reduce((sum, acc) => sum + convertCurrency(acc.expense || 0, acc.currency, baseCurrency, rates), 0);

  const currencySymbol = getCurrencySymbol(baseCurrency);

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

      <div className="mt-6 flex flex-row items-center justify-between gap-2 px-1 sm:px-2">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[9px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1 truncate">
            Total Balance
          </span>
          <span className="font-mono text-base sm:text-3xl font-semibold tracking-tight text-foreground truncate">
            <AnimatedCounter value={totalBalance} prefix={currencySymbol} />
          </span>
        </div>
        
        <div className="flex flex-col items-end min-w-0 flex-1">
          <span className="text-[9px] sm:text-xs font-medium uppercase tracking-wider text-oreo-dusty-teal mb-0.5 sm:mb-1 truncate">
            Income
          </span>
          <span className="font-mono text-sm sm:text-3xl font-semibold tracking-tight text-foreground truncate">
            <AnimatedCounter value={totalIncome} prefix={currencySymbol} />
          </span>
        </div>
        
        <div className="flex flex-col items-end min-w-0 flex-1">
          <span className="text-[9px] sm:text-xs font-medium uppercase tracking-wider text-oreo-mauve mb-0.5 sm:mb-1 truncate">
            Expenses
          </span>
          <span className="font-mono text-sm sm:text-3xl font-semibold tracking-tight text-foreground truncate">
            <AnimatedCounter value={totalExpense} prefix={currencySymbol} />
          </span>
        </div>
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
        onOpenChange={React.useCallback((open: boolean) => {
          if (!open) setEditingAccount(null);
        }, [])} 
      />
    </>
  );
}
