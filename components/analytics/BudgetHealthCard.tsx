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
import { getCurrencySymbol } from "@/lib/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";

interface BudgetHealthCardProps {
  budgets: AnalyticsBudget[];
  baseCurrency: string;
}

export function BudgetHealthCard({ budgets, baseCurrency }: BudgetHealthCardProps) {
  const currencySymbol = getCurrencySymbol(baseCurrency);
  const isDesktop = useMediaQuery("(min-width: 768px)");

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

            {/* Modal Trigger */}
            <div className="mt-4 pt-4 border-t border-border">
              {isDesktop ? (
                <Sheet>
                  <SheetTrigger render={
                    <Button variant="outline" className="w-full text-oreo-slate-purple hover:bg-oreo-periwinkle/10 hover:text-oreo-slate-purple">
                      View Budget Breakdown
                    </Button>
                  } />
                  <SheetContent className="w-[400px] sm:w-[540px] px-0 flex flex-col">
                    <SheetHeader className="mb-2 px-6 shrink-0">
                      <SheetTitle className="text-oreo-slate-purple">Budget Breakdown</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-1 px-6">
                      <div className="flex flex-col gap-6 pb-8 pt-2">
                        {activeBudgets.map((b) => {
                          const limit = b.currentPeriod?.effective_limit ?? 0;
                          const spent = b.computedSpent;
                          const over = spent > limit;
                          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                          return (
                            <div key={b.id} className="flex flex-col gap-2 min-w-0">
                              <div className="flex justify-between items-center text-sm gap-3">
                                <span className="font-medium truncate flex-1">{b.category?.name}</span>
                                <span className={cn("font-mono shrink-0", over ? "text-oreo-mauve font-bold" : "text-muted-foreground")}>
                                  {currencySymbol}{spent.toFixed(0)} <span className="opacity-70">/ {limit.toFixed(0)}</span>
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
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
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              ) : (
                <Dialog>
                  <DialogTrigger render={
                    <Button variant="outline" className="w-full text-oreo-slate-purple hover:bg-oreo-periwinkle/10 hover:text-oreo-slate-purple">
                      View Budget Breakdown
                    </Button>
                  } />
                  <DialogContent className="max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col">
                    <DialogHeader className="p-4 pb-2 shrink-0">
                      <DialogTitle className="text-oreo-slate-purple text-left">Budget Breakdown</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="flex-1 px-4 pb-4">
                      <div className="flex flex-col gap-6 pt-2 pb-6">
                        {activeBudgets.map((b) => {
                          const limit = b.currentPeriod?.effective_limit ?? 0;
                          const spent = b.computedSpent;
                          const over = spent > limit;
                          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                          return (
                            <div key={b.id} className="flex flex-col gap-2 min-w-0">
                              <div className="flex justify-between items-center text-sm gap-3">
                                <span className="font-medium truncate flex-1">{b.category?.name}</span>
                                <span className={cn("font-mono shrink-0", over ? "text-oreo-mauve font-bold" : "text-muted-foreground")}>
                                  {currencySymbol}{spent.toFixed(0)} <span className="opacity-70">/ {limit.toFixed(0)}</span>
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
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
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
