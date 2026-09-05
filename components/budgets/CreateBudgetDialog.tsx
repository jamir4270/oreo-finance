"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createBudget } from "@/app/actions/budgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export type BudgetCategoryData = {
  id: string;
  name: string;
  icon: string;
  txn_type: string;
};

interface CreateBudgetDialogProps {
  categories: BudgetCategoryData[];
  existingCategoryIds: string[];
  baseCurrency: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full mt-4" disabled={pending}>
      {pending ? "Creating..." : "Create Budget"}
    </Button>
  );
}

import { getCurrencySymbol } from "@/lib/currency";

export function CreateBudgetDialog({
  categories,
  existingCategoryIds,
  baseCurrency,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: CreateBudgetDialogProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setUncontrolledOpen;

  const [periodType, setPeriodType] = React.useState("monthly");
  const [state, formAction] = useActionState(createBudget, null);

  React.useEffect(() => {
    if (state?.success) {
      setOpen(false);
      toast.success("Budget created successfully");
    }
  }, [state, setOpen]);

  React.useEffect(() => {
    if (open) {
      setPeriodType("monthly");
    }
  }, [open]);

  // Only show expense categories that don't already have a budget
  const availableCategories = categories.filter(
    (c) => c.txn_type === "expense" && !existingCategoryIds.includes(c.id)
  );

  const currencySymbol = getCurrencySymbol(baseCurrency);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Budget</DialogTitle>
          <DialogDescription>
            Set a spending limit for a category.
          </DialogDescription>
        </DialogHeader>

        <form key="create-budget" action={formAction} className="flex flex-col gap-4 mt-2">
          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="category_id">Category</Label>
            {availableCategories.length > 0 ? (
              <select
                id="category_id"
                name="category_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted-foreground">
                All expense categories already have budgets.
              </p>
            )}
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
              placeholder="0.00"
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
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
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
