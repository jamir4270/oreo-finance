import Link from "next/link";
import { ChevronRight, PiggyBank } from "lucide-react";
import { formatAmount } from "@/lib/currency";

interface SafeToSpendCardProps {
  perDay: number;
  left: number;
  active: number;
  overspent: number;
  baseCurrency: string;
  currencySymbol: string;
}

/**
 * The number people check daily: how much they can still spend today and stay within
 * every budget. Styled like an iOS widget: one big figure, one line of context.
 */
export function SafeToSpendCard({ perDay, left, active, overspent, baseCurrency, currencySymbol }: SafeToSpendCardProps) {
  if (active === 0) {
    return (
      <Link
        href="/budgets"
        className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-oreo-sm transition-transform duration-150 active:scale-[0.98]"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-oreo-lavender/60 text-oreo-slate-purple">
          <PiggyBank className="size-6" aria-hidden />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-semibold text-foreground">See what you can spend each day</span>
          <span className="block text-[13px] text-muted-foreground">Set a budget and Oreo works out a daily allowance.</span>
        </span>
        <ChevronRight className="size-5 text-muted-foreground/60" aria-hidden />
      </Link>
    );
  }

  const allOver = overspent === active;
  return (
    <Link
      href="/budgets"
      aria-label={`Safe to spend today: ${currencySymbol}${formatAmount(perDay, baseCurrency)}. View budgets`}
      className="flex flex-col gap-1 rounded-3xl bg-card p-5 shadow-oreo-sm transition-transform duration-150 active:scale-[0.98]"
    >
      <span className="flex items-center justify-between text-[13px] font-medium text-muted-foreground">
        Safe to spend today
        <ChevronRight className="size-4 text-muted-foreground/60" aria-hidden />
      </span>
      <span
        className={`font-heading text-[34px] leading-tight font-semibold tabular-nums ${allOver ? "text-oreo-mauve" : "text-oreo-dusty-teal"}`}
      >
        {currencySymbol}
        {formatAmount(perDay, baseCurrency)}
      </span>
      <span className="text-[13px] text-muted-foreground">
        {allOver
          ? "Every budget is spent for this period."
          : `${currencySymbol}${formatAmount(left, baseCurrency)} left across ${active - overspent} budget${active - overspent === 1 ? "" : "s"}`}
        {overspent > 0 && !allOver && (
          <span className="text-oreo-mauve"> · {overspent} over</span>
        )}
      </span>
    </Link>
  );
}
