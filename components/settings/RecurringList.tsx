"use client";

import * as React from "react";
import { Repeat } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConfirmDestructive } from "@/components/ui/confirm-destructive";
import { DynamicIcon } from "@/lib/icons";
import { formatAmount } from "@/lib/currency";
import { stopRecurring } from "@/app/actions/recurring";

export type RecurringRule = {
  id: string;
  type: string;
  amount: number;
  frequency: string;
  next_date: string;
  note: string | null;
  account: { name: string; currency: string } | null;
  category: { name: string; icon: string } | null;
};

const EVERY: Record<string, string> = { daily: "Every day", weekly: "Every week", monthly: "Every month", yearly: "Every year" };

export function RecurringList({ rules }: { rules: RecurringRule[] }) {
  const [stopping, setStopping] = React.useState<RecurringRule | null>(null);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground px-1 uppercase tracking-wider">Recurring</h2>
      <Card className="flex flex-col overflow-hidden">
        {rules.length === 0 ? (
          <div className="flex items-center gap-3 p-4 sm:px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-oreo-periwinkle/20 text-oreo-slate-purple">
              <Repeat className="h-4 w-4" />
            </div>
            <span className="text-sm text-muted-foreground">
              Nothing repeats yet. Choose <span className="font-medium text-foreground">Repeat</span> when logging a transaction.
            </span>
          </div>
        ) : (
          rules.map((rule, i) => {
            const currency = rule.account?.currency ?? "";
            const next = new Date(`${rule.next_date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
            return (
              <React.Fragment key={rule.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center gap-3 p-4 sm:px-6">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-oreo-periwinkle/20 text-oreo-slate-purple">
                    <DynamicIcon icon={rule.category?.icon} className="h-4 w-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {rule.note || rule.category?.name || "Recurring"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {EVERY[rule.frequency] ?? rule.frequency} · next {next} · {rule.account?.name}
                    </span>
                  </div>
                  <span className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${rule.type === "expense" ? "text-oreo-mauve" : "text-oreo-dusty-teal"}`}>
                    {rule.type === "expense" ? "-" : "+"}{formatAmount(Number(rule.amount), currency)} <span className="font-sans text-[10px] font-medium text-muted-foreground">{currency}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStopping(rule)}
                    className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 active:bg-destructive/15"
                  >
                    Stop
                  </button>
                </div>
              </React.Fragment>
            );
          })
        )}
      </Card>

      <ConfirmDestructive
        open={!!stopping}
        onOpenChange={(open) => {
          if (!open) setStopping(null);
        }}
        title="Stop repeating?"
        description="No new entries will be created. Ones already logged stay in your history."
        confirmLabel="Stop Repeating"
        pendingLabel="Stopping..."
        successMessage="Repeat stopped"
        onConfirm={() => (stopping ? stopRecurring(stopping.id) : undefined)}
      />
    </section>
  );
}
