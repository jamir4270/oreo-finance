"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateBudget } from "@/app/actions/budgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BudgetCardData } from "./BudgetCard";
import { toast } from "sonner";

interface EditBudgetDialogProps {
  budget: BudgetCardData;
  baseCurrency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full mt-4" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
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

export function EditBudgetDialog({
  budget,
  baseCurrency,
  open,
  onOpenChange,
}: EditBudgetDialogProps) {
  const [periodType, setPeriodType] = React.useState(budget.period_type);

  const actionWithId = updateBudget.bind(null, budget.id);
  const [state, formAction] = useActionState(actionWithId, null);

  React.useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      toast.success("Budget updated successfully");
    }
  }, [state, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      setPeriodType(budget.period_type);
    }
  }, [open, budget.period_type]);

  const currencySymbol = getCurrencySymbol(baseCurrency);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>
            Changes take effect from the current period forward.
          </DialogDescription>
        </DialogHeader>

        <form key={budget.id} action={formAction} className="flex flex-col gap-4 mt-2">
          {/* Category (read-only) */}
          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <div className="flex h-10 items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
              {budget.category?.name || "Uncategorized"}
            </div>
          </div>

          {/* Limit Amount */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="limit_amount">Limit ({currencySymbol})</Label>
            <Input
              id="limit_amount"
              name="limit_amount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={budget.limit_amount}
              required
            />
          </div>

          {/* Period Type */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="period_type">Period</Label>
            <select
              id="period_type"
              name="period_type"
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
            {periodType !== budget.period_type && (
              <p className="text-xs text-oreo-mauve">
                Changing the period type will reset the period cycle.
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={budget.start_date}
              required
            />
          </div>

          {/* End Date (custom only) */}
          {periodType === "custom" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={budget.end_date || ""}
                required={periodType === "custom"}
              />
            </div>
          )}

          {state?.error && (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          )}

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
