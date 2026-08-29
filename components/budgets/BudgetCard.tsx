"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export interface BudgetCardData {
  id: string;
  category_id: string;
  limit_amount: number;
  period_type: string;
  start_date: string;
  end_date: string | null;
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

interface BudgetCardProps {
  budget: BudgetCardData;
  baseCurrency: string;
  onClick: (budget: BudgetCardData) => void;
}

export function BudgetCard({ budget, baseCurrency, onClick }: BudgetCardProps) {
  const iconName = budget.category?.icon || "Tag";
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Tag;

  const effectiveLimit = budget.currentPeriod?.effective_limit ?? budget.limit_amount;
  const spent = budget.computedSpent;
  const rolloverIn = budget.currentPeriod?.rollover_in ?? 0;

  const isOverBudget = spent > effectiveLimit;
  const remaining = effectiveLimit - spent;
  const progressPercent = effectiveLimit > 0 ? Math.min((spent / effectiveLimit) * 100, 100) : 0;

  // Format period label
  const periodLabel = formatPeriodLabel(budget);

  // Currency formatting
  const currencySymbol = getCurrencySymbol(baseCurrency);

  return (
    <div
      onClick={() => onClick(budget)}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md cursor-pointer hover:border-muted-foreground/30 active:scale-[0.98]"
      role="button"
      tabIndex={0}
      id={`budget-card-${budget.id}`}
    >
      {/* Header: Icon + Category + Period */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-oreo-lavender/50 text-oreo-slate-purple">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-heading text-base font-medium text-foreground">
              {budget.category?.name || "Uncategorized"}
            </h3>
            <span className="text-xs text-muted-foreground">{periodLabel}</span>
          </div>
        </div>

        {/* Rollover badge */}
        {rolloverIn !== 0 && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              rolloverIn > 0
                ? "bg-oreo-dusty-teal-light/30 text-oreo-dusty-teal"
                : "bg-oreo-dusty-rose/30 text-oreo-mauve"
            )}
          >
            {rolloverIn > 0 ? "↑" : "↓"} {currencySymbol}
            {Math.abs(rolloverIn).toFixed(0)} rollover
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              isOverBudget
                ? "bg-oreo-mauve"
                : "bg-oreo-periwinkle"
            )}
            style={{ width: `${isOverBudget ? 100 : progressPercent}%` }}
          />
        </div>

        {/* Numeric label */}
        <div className="flex items-center justify-between">
          <span className={cn("font-mono text-sm font-semibold", isOverBudget ? "text-oreo-mauve" : "text-foreground")}>
            {currencySymbol}{spent.toFixed(2)}
            <span className="font-sans font-normal text-muted-foreground"> spent of </span>
            {currencySymbol}{effectiveLimit.toFixed(2)}
          </span>
          <span
            className={cn(
              "font-mono text-sm font-semibold",
              isOverBudget ? "text-oreo-mauve" : "text-oreo-dusty-teal"
            )}
          >
            {isOverBudget
              ? `${currencySymbol}${Math.abs(remaining).toFixed(2)} over`
              : `${currencySymbol}${remaining.toFixed(2)} left`}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatPeriodLabel(budget: BudgetCardData): string {
  const period = budget.currentPeriod;
  if (!period) return budget.period_type;

  const start = new Date(period.period_start + "T00:00:00");
  const end = new Date(period.period_end + "T00:00:00");

  if (budget.period_type === "monthly") {
    return start.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }

  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = start.toLocaleDateString(undefined, opts);
  const endStr = end.toLocaleDateString(undefined, opts);
  return `${startStr} – ${endStr}`;
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
