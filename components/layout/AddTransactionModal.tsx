"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionModal({
  open,
  onOpenChange,
}: AddTransactionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-oreo-slate-purple">
            Add Transaction
          </DialogTitle>
          <DialogDescription>
            This form will be fully implemented in Phase 9.
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
          <p className="text-sm text-muted-foreground text-center px-4">
            Transaction form coming soon! <br />
            (Expense, Income, Transfer)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
