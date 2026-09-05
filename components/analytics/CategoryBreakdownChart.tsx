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
import { getCurrencySymbol } from "@/lib/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";

interface CategoryBreakdownChartProps {
  transactions: AnalyticsTransaction[];
  baseCurrency: string;
}

export function CategoryBreakdownChart({
  transactions,
  baseCurrency,
}: CategoryBreakdownChartProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

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

  const topCategories = groupedData.slice(0, 3);

  const renderCategoryItem = (item: { name: string; value: number }, index: number) => {
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
  };

  return (
    <Card className="flex flex-col h-full border-0 shadow-sm" style={{ boxShadow: "0 4px 24px rgba(86, 86, 118, 0.06), 0 1px 4px rgba(86, 86, 118, 0.03)" }}>
      <CardHeader className="pb-4">
        <CardTitle className="font-heading text-2xl text-oreo-slate-purple">Spending by Category</CardTitle>
        <CardDescription className="text-sm">Breakdown of expenses for selected period</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {totalExpense === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center gap-4 py-8">
            <img src="/oreo.svg" alt="Mascot" className="w-24 h-24 sm:w-32 sm:h-32 opacity-80" />
            <p className="text-sm text-muted-foreground max-w-[250px]">
              No expenses this period. Either you're saving like a pro, or you haven't tracked anything yet!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 flex-1">
            <div className="flex flex-col gap-5 px-1">
              {topCategories.map((item, index) => renderCategoryItem(item, index))}
            </div>

            {/* Modal Trigger */}
            <div className="mt-auto pt-4 border-t border-border">
              {isDesktop ? (
                <Sheet>
                  <SheetTrigger render={
                    <Button variant="outline" className="w-full text-oreo-slate-purple hover:bg-oreo-periwinkle/10 hover:text-oreo-slate-purple">
                      View Full List
                    </Button>
                  } />
                  <SheetContent className="w-[400px] sm:w-[540px] px-0 flex flex-col">
                    <SheetHeader className="mb-2 px-6 shrink-0">
                      <SheetTitle className="text-oreo-slate-purple">Spending by Category</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-1 px-6">
                      <div className="flex flex-col gap-5 pb-8 pt-2">
                        {groupedData.map((item, index) => renderCategoryItem(item, index))}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              ) : (
                <Dialog>
                  <DialogTrigger render={
                    <Button variant="outline" className="w-full text-oreo-slate-purple hover:bg-oreo-periwinkle/10 hover:text-oreo-slate-purple">
                      View Full List
                    </Button>
                  } />
                  <DialogContent className="max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col">
                    <DialogHeader className="p-4 pb-2 shrink-0">
                      <DialogTitle className="text-oreo-slate-purple text-left">Spending by Category</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="flex-1 px-4 pb-4">
                      <div className="flex flex-col gap-5 pt-2 pb-6">
                        {groupedData.map((item, index) => renderCategoryItem(item, index))}
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
