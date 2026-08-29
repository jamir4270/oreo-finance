"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Pencil, Trash2, Calendar, Target, TrendingUp, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BudgetCardData } from "./BudgetCard";
import { cn } from "@/lib/utils";

interface BudgetDetailDialogProps {
  budget: BudgetCardData | null;
  baseCurrency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (budget: BudgetCardData) => void;
  onDelete: (budget: BudgetCardData) => void;
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

export function BudgetDetailDialog({
  budget,
  baseCurrency,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: BudgetDetailDialogProps) {
  if (!budget) return null;

  const iconName = budget.category?.icon || "Tag";
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Tag;

  const period = budget.currentPeriod;
  const effectiveLimit = period?.effective_limit ?? budget.limit_amount;
  const spent = budget.computedSpent;
  const rolloverIn = period?.rollover_in ?? 0;
  const remaining = effectiveLimit - spent;
  const isOverBudget = spent > effectiveLimit;

  const currencySymbol = getCurrencySymbol(baseCurrency);

  // Format period dates
  let periodDateStr = "";
  if (period) {
    const start = new Date(period.period_start + "T00:00:00");
    const end = new Date(period.period_end + "T00:00:00");
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    periodDateStr = `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
  }

  const periodTypeLabel =
    budget.period_type === "weekly" ? "Weekly" :
    budget.period_type === "monthly" ? "Monthly" : "Custom";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="sr-only">Budget Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-oreo-lavender/50 text-oreo-slate-purple">
            <Icon className="h-8 w-8" />
          </div>
          <div className="flex flex-col items-center gap-1 w-full min-w-0">
            <h2 className="text-xl font-semibold text-foreground truncate max-w-full px-4 text-center">
              {budget.category?.name || "Uncategorized"}
            </h2>
            <span className="text-sm text-muted-foreground capitalize">{periodTypeLabel} budget</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4 w-full min-w-0">
          {/* Period */}
          <div className="flex items-start gap-3 w-full min-w-0">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground">Current Period</span>
              <span className="text-sm text-muted-foreground truncate">{periodDateStr || "Not started"}</span>
            </div>
          </div>

          {/* Base Limit */}
          <div className="flex items-start gap-3 w-full min-w-0">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground">Base Limit</span>
              <span className="text-sm font-mono text-muted-foreground">
                {currencySymbol}{budget.limit_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Rollover */}
          {rolloverIn !== 0 && (
            <div className="flex items-start gap-3 w-full min-w-0">
              {rolloverIn > 0 ? (
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-oreo-dusty-teal" />
              ) : (
                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-oreo-mauve" />
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground">
                  {rolloverIn > 0 ? "Surplus Rollover" : "Deficit Rollover"}
                </span>
                <span className={cn(
                  "text-sm font-mono",
                  rolloverIn > 0 ? "text-oreo-dusty-teal" : "text-oreo-mauve"
                )}>
                  {rolloverIn > 0 ? "+" : ""}{currencySymbol}{rolloverIn.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Effective Limit */}
          <div className="flex items-start gap-3 w-full min-w-0">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground">Effective Limit</span>
              <span className="text-sm font-mono text-foreground font-semibold">
                {currencySymbol}{effectiveLimit.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actual Spent */}
          <div className="flex items-start gap-3 w-full min-w-0">
            <LucideIcons.Receipt className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground">Spent</span>
              <span className={cn("text-sm font-mono font-semibold", isOverBudget ? "text-oreo-mauve" : "text-foreground")}>
                {currencySymbol}{spent.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Remaining */}
          <div className="flex items-start gap-3 w-full min-w-0">
            <LucideIcons.Wallet className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground">
                {isOverBudget ? "Over Budget" : "Remaining"}
              </span>
              <span className={cn(
                "text-sm font-mono font-semibold",
                isOverBudget ? "text-oreo-mauve" : "text-oreo-dusty-teal"
              )}>
                {isOverBudget ? "-" : ""}{currencySymbol}{Math.abs(remaining).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3 w-full">
          <Button
            variant="outline"
            className="w-full sm:flex-1"
            onClick={() => {
              onOpenChange(false);
              onEdit(budget);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="destructive"
            className="w-full sm:flex-1"
            onClick={() => {
              onOpenChange(false);
              onDelete(budget);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
