"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalyticsTransaction } from "./AnalyticsPageClient";
import { cn } from "@/lib/utils";

interface CategoryBreakdownChartProps {
  transactions: AnalyticsTransaction[];
  baseCurrency: string;
}

export function CategoryBreakdownChart({
  transactions,
  baseCurrency,
}: CategoryBreakdownChartProps) {
  // We want to show a breakdown of EXPENSES by category.
  const expenses = transactions.filter((t) => t.type === "expense");

  // Group by category name and sort descending
  const groupedData = React.useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((t) => {
      const catName = t.category?.name || "Uncategorized";
      const current = map.get(catName) || 0;
      map.set(catName, current + t.convertedAmount);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalExpense = groupedData.reduce((acc, curr) => acc + curr.value, 0);
  const maxExpense = groupedData.length > 0 ? groupedData[0].value : 0;

  // Generate color palette based on oreo colors (mainly mauve and rose for expenses)
  const COLORS = [
    "var(--color-oreo-mauve)",
    "var(--color-oreo-dusty-rose)",
    "var(--color-oreo-periwinkle)",
    "var(--color-oreo-slate-purple)",
    "var(--color-oreo-lavender)",
    "var(--color-oreo-dusty-teal)", 
  ];

  const currencySymbol = getCurrencySymbol(baseCurrency);

  return (
    <Card className="flex flex-col h-full border-0 shadow-sm" style={{ boxShadow: "0 4px 24px rgba(86, 86, 118, 0.06), 0 1px 4px rgba(86, 86, 118, 0.03)" }}>
      <CardHeader className="pb-4">
        <CardTitle className="font-heading text-2xl text-oreo-slate-purple">Spending by Category</CardTitle>
        <CardDescription className="text-sm">Breakdown of expenses for selected period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {totalExpense === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center gap-4 py-8">
            <img src="/oreo.svg" alt="Mascot" className="w-24 h-24 sm:w-32 sm:h-32 opacity-80" />
            <p className="text-sm text-muted-foreground max-w-[250px]">
              No expenses this period. Either you're saving like a pro, or you haven't tracked anything yet!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-h-[350px] overflow-y-auto px-1 pb-4">
            {groupedData.map((item, index) => {
              const fill = COLORS[index % COLORS.length];
              const pct = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
              return (
                <div key={item.name} className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center justify-between text-sm gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: fill }} />
                      <span className="font-medium truncate">{item.name}</span>
                    </div>
                    <span className="font-mono text-muted-foreground shrink-0">
                      {currencySymbol}{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      style={{ backgroundColor: fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getCurrencySymbol(currency: string): string {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    const symbolPart = parts.find((p) => p.type === "currency");
    return symbolPart?.value || currency;
  } catch {
    return currency;
  }
}
