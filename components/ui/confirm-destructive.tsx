"use client";

import * as React from "react";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ActionSheet } from "@/components/ui/action-sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDestructiveProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  /** e.g. "Delete Budget" */
  confirmLabel: string;
  /** Return { error } to report a failure; resolve normally on success. */
  onConfirm: () => Promise<{ error?: string } | null | void> | void;
  successMessage?: string;
  /** Desktop button text while running */
  pendingLabel?: string;
}

/**
 * Destructive confirmation that follows platform conventions:
 * phones get an iOS action sheet (closes at once, failures arrive as a toast);
 * desktop gets an alert dialog that stays open with a pending state and inline error.
 */
export function ConfirmDestructive({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  successMessage,
  pendingLabel = "Deleting...",
}: ConfirmDestructiveProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const run = (closeFirst: boolean) => {
    setError(null);
    if (closeFirst) onOpenChange(false);
    startTransition(async () => {
      const result = await onConfirm();
      if (result && result.error) {
        if (closeFirst) toast.error(result.error);
        else setError(result.error);
        return;
      }
      if (!closeFirst) onOpenChange(false);
      if (successMessage) toast.success(successMessage);
    });
  };

  if (!isDesktop) {
    return (
      <ActionSheet
        open={open}
        onOpenChange={onOpenChange}
        message={typeof description === "string" ? description : undefined}
        actions={[{ label: confirmLabel, destructive: true, onSelect: () => run(true) }]}
      />
    );
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isPending) return;
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div role="alert" className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              run(false);
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
