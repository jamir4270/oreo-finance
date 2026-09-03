"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalyticsBudget } from "./AnalyticsPageClient";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BudgetHealthCardProps {
  budgets: AnalyticsBudget[];
  baseCurrency: string;
}

export function BudgetHealthCard({ budgets, baseCurrency }: BudgetHealthCardProps) {
  const currencySymbol = getCurrencySymbol(baseCurrency);

  // Active budgets are those with a current period
  const activeBudgets = budgets.filter((b) => b.currentPeriod !== null);

  const totalBudgeted = activeBudgets.reduce(
    (sum, b) => sum + (b.currentPeriod?.effective_limit ?? 0),
    0
  );
  const totalSpent = activeBudgets.reduce((sum, b) => sum + b.computedSpent, 0);

  const isOverBudget = totalSpent > totalBudgeted;
  const progressPercent = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0;

  return (
    <Card className="h-full border-0 shadow-sm" style={{ boxShadow: "0 4px 24px rgba(86, 86, 118, 0.06), 0 1px 4px rgba(86, 86, 118, 0.03)" }}>
      <CardHeader className="pb-4">
        <CardTitle className="font-heading text-2xl text-oreo-slate-purple">Budget Health</CardTitle>
        <CardDescription className="text-sm">Overview of active budgets</CardDescription>
      </CardHeader>
      <CardContent>
        {activeBudgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[250px] text-center gap-4 py-8">
            <img src="/oreo.svg" alt="Mascot" className="w-24 h-24 sm:w-32 sm:h-32 opacity-80" />
            <p className="text-sm text-muted-foreground max-w-[250px]">
              No active budgets yet. Let's set some limits to keep you on track!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Overall Summary */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Total Budget Utilization
              </span>
              <div className="flex items-baseline justify-between">
                <span className={cn("text-4xl font-mono font-bold tracking-tight", isOverBudget ? "text-oreo-mauve" : "text-foreground")}>
                  {currencySymbol}{totalSpent.toFixed(0)}
                  <span className="text-2xl font-sans font-normal text-muted-foreground"> / {totalBudgeted.toFixed(0)}</span>
                </span>
                <span className={cn("text-sm font-semibold tracking-wide uppercase rounded-full px-2.5 py-1", isOverBudget ? "bg-oreo-mauve/10 text-oreo-mauve" : "bg-oreo-dusty-teal/10 text-oreo-dusty-teal")}>
                  {isOverBudget ? "Over Budget" : "On Track"}
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-muted/60 mt-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    isOverBudget ? "bg-oreo-mauve" : "bg-oreo-periwinkle"
                  )}
                  style={{ width: `${isOverBudget ? 100 : progressPercent}%` }}
                />
              </div>
            </div>

            {/* Individual budgets compact list */}
            <div className="flex flex-col gap-5 mt-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Individual Budgets
              </span>
              <div className="flex flex-col gap-4">
                {activeBudgets.slice(0, 4).map((b) => {
                  const limit = b.currentPeriod?.effective_limit ?? 0;
                  const spent = b.computedSpent;
                  const over = spent > limit;
                  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                  
                  return (
                    <div key={b.id} className="flex flex-col gap-1 min-w-0">
                      <div className="flex justify-between items-center text-sm min-w-0 gap-2">
                        <span className="font-medium truncate flex-1">{b.category?.name}</span>
                        <span className={cn("font-mono shrink-0", over ? "text-oreo-mauve" : "text-muted-foreground")}>
                          {currencySymbol}{spent.toFixed(0)} / {limit.toFixed(0)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            over ? "bg-oreo-mauve" : "bg-oreo-periwinkle"
                          )}
                          style={{ width: `${over ? 100 : pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {activeBudgets.length > 4 && (
                  <Link href="/budgets" className="text-xs text-center text-oreo-slate-purple hover:underline pt-2 font-medium transition-colors">
                    View all {activeBudgets.length} budgets &rarr;
                  </Link>
                )}
              </div>
            </div>
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
