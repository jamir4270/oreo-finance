"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryBreakdownChart } from "./CategoryBreakdownChart";
import { TrendsChart } from "./TrendsChart";
import { BudgetHealthCard } from "./BudgetHealthCard";

export interface AnalyticsTransaction {
  id: string;
  type: string;
  amount: number;
  txn_date: string;
  category_id: string;
  account_id: string;
  category?: { name: string; icon: string; txn_type: string };
  convertedAmount: number; // Amount converted to base currency
}

export interface AnalyticsBudget {
  id: string;
  category_id: string;
  limit_amount: number;
  period_type: string;
  category: { name: string; icon: string; txn_type: string } | null;
  currentPeriod: {
    id: string;
    period_start: string;
    period_end: string;
    base_limit: number;
    rollover_in: number;
    effective_limit: number;
    actual_spent: number;
  } | null;
  computedSpent: number;
}

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export interface AnalyticsAccount {
  id: string;
  name: string;
  currency: string;
}

interface AnalyticsPageClientProps {
  transactions: AnalyticsTransaction[];
  budgets: AnalyticsBudget[];
  accounts: AnalyticsAccount[];
  baseCurrency: string;
  initialDateRange: string;
  initialAccountFilter: string;
}

export function AnalyticsPageClient({
  transactions,
  budgets,
  accounts,
  baseCurrency,
  initialDateRange,
  initialAccountFilter,
}: AnalyticsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dateRange = initialDateRange || "last_30";
  const accountFilter = initialAccountFilter || "all";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const today = new Date();
  
  // Filter transactions based on dateRange and accountFilter
  const filteredTransactions = React.useMemo(() => {
    let startDate = new Date(0); // far past
    if (dateRange === "last_30") {
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
    } else if (dateRange === "this_month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (dateRange === "last_month") {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return transactions.filter(t => {
        const d = new Date(t.txn_date + "T00:00:00");
        const matchDate = d >= startDate && d <= endOfLastMonth;
        const matchAcc = accountFilter === "all" || t.account_id === accountFilter;
        return matchDate && matchAcc;
      });
    } else if (dateRange === "this_year") {
      startDate = new Date(today.getFullYear(), 0, 1);
    }

    return transactions.filter((t) => {
      const d = new Date(t.txn_date + "T00:00:00");
      const matchDate = d >= startDate;
      const matchAcc = accountFilter === "all" || t.account_id === accountFilter;
      return matchDate && matchAcc;
    });
  }, [transactions, dateRange, accountFilter]);

  if (transactions.length === 0 && budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] text-center gap-6">
        <img src="/oreo.svg" alt="Oreo the Cat" className="w-48 h-48 sm:w-64 sm:h-64 opacity-90 drop-shadow-sm" />
        <div className="max-w-md space-y-2">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-oreo-slate-purple">
            No data yet!
          </h2>
          <p className="text-muted-foreground">
            Start adding transactions and budgets to see your analytics dashboard come to life. 
            Oreo is waiting to crunch those numbers!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-8">
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight text-oreo-slate-purple">
            Analytics
          </h1>
          <p className="text-base text-muted-foreground">
            Gain insights into your spending and trends.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto min-w-0">
          <Select value={accountFilter} onValueChange={(val) => val && updateFilter("account", val)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card/50 min-w-0 capitalize">
              <span data-slot="select-value" className="flex flex-1 text-left truncate">
                {accountFilter === "all" ? "All Accounts" : accounts.find(a => a.id === accountFilter)?.name || "Account"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="capitalize" label="All Accounts">All Accounts</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id} className="capitalize" label={a.name}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={(val) => val && updateFilter("dateRange", val)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card/50 min-w-0 capitalize">
              <span data-slot="select-value" className="flex flex-1 text-left truncate">
                {
                  dateRange === "last_30" ? "Last 30 Days" :
                  dateRange === "this_month" ? "This Month" :
                  dateRange === "last_month" ? "Last Month" :
                  dateRange === "this_year" ? "This Year" :
                  dateRange === "all_time" ? "All Time" : "Date Range"
                }
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_30" className="capitalize" label="Last 30 Days">Last 30 Days</SelectItem>
              <SelectItem value="this_month" className="capitalize" label="This Month">This Month</SelectItem>
              <SelectItem value="last_month" className="capitalize" label="Last Month">Last Month</SelectItem>
              <SelectItem value="this_year" className="capitalize" label="This Year">This Year</SelectItem>
              <SelectItem value="all_time" className="capitalize" label="All Time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Category Breakdown (Pie/Bar) */}
        <div className="flex flex-col gap-4">
          <CategoryBreakdownChart
            transactions={filteredTransactions}
            baseCurrency={baseCurrency}
          />
        </div>

        {/* Budget vs Actual Summary */}
        <div className="flex flex-col gap-4">
          <BudgetHealthCard budgets={budgets} baseCurrency={baseCurrency} />
        </div>

        {/* Trends Over Time (Area/Line) & Calendar */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <TrendsChart 
            transactions={filteredTransactions} 
            allTransactions={transactions}
            baseCurrency={baseCurrency} 
            dateRange={dateRange} 
          />
        </div>
      </div>
    </>
  );
}
