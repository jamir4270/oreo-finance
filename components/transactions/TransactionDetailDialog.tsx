"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Pencil, Trash2, Calendar, Wallet, Tag as TagIcon, AlignLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionData } from "./TransactionDialog";
import { cn } from "@/lib/utils";

interface TransactionDetailDialogProps {
  transaction: TransactionData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (transaction: TransactionData) => void;
  onDelete: (transaction: TransactionData) => void;
}

export function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TransactionDetailDialogProps) {
  if (!transaction) return null;

  const isExpense = transaction.type === "expense";
  const isTransfer = transaction.type === "transfer";
  const iconName = transaction.category?.icon || "Tag";
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Tag;

  const amountColor = isTransfer ? "text-foreground" : isExpense ? "text-oreo-mauve" : "text-oreo-dusty-teal";
  const prefix = isTransfer ? "" : isExpense ? "-" : "+";

  const dateObj = new Date(transaction.txn_date);
  // Using date-fns or native format
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="sr-only">Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-oreo-lavender/50 text-oreo-slate-purple">
            <Icon className="h-8 w-8" />
          </div>
          <div className="flex flex-col items-center gap-1 w-full min-w-0">
            <h2 className="text-xl font-semibold text-foreground truncate max-w-full px-4 text-center">
              {transaction.category?.name || "Uncategorized"}
            </h2>
            <div className={cn("font-mono text-3xl font-bold max-w-full truncate px-4 text-center", amountColor)}>
              {prefix}{transaction.amount.toFixed(2)}
              {transaction.account?.currency && (
                <span className="ml-1.5 text-base font-medium text-muted-foreground font-sans">
                  {transaction.account.currency}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4 w-full min-w-0">
          <div className="flex items-start gap-3 w-full min-w-0">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground">
                {isTransfer ? "Source Account" : "Account"}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {transaction.account?.name || "Unknown Account"}
                {transaction.account?.currency && (
                  <span className="ml-1 font-mono text-xs opacity-70">{transaction.account.currency}</span>
                )}
              </span>
            </div>
          </div>

          {isTransfer && transaction.to_account?.name && (
            <div className="flex items-start gap-3 w-full min-w-0">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground">Destination Account</span>
                <span className="text-sm text-muted-foreground truncate">
                  {transaction.to_account.name}
                  {transaction.to_account?.currency && (
                    <span className="ml-1 font-mono text-xs opacity-70">{transaction.to_account.currency}</span>
                  )}
                </span>
              </div>
            </div>
          )}

          {isTransfer && transaction.to_amount != null && transaction.exchange_rate != null && transaction.exchange_rate !== 1 && (
            <div className="flex items-start gap-3 w-full min-w-0">
              <TagIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground">Converted Amount</span>
                <span className="text-sm text-muted-foreground truncate">
                  {transaction.to_amount.toFixed(2)} {transaction.to_account?.currency} 
                  <span className="opacity-70 ml-1 text-xs">(Rate: {transaction.exchange_rate.toFixed(4)})</span>
                </span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 w-full min-w-0">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground">Date</span>
              <span className="text-sm text-muted-foreground truncate">{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 w-full min-w-0">
            <TagIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground">Type</span>
              <span className="text-sm capitalize text-muted-foreground truncate">{transaction.type}</span>
            </div>
          </div>

          {transaction.note && (
            <div className="flex items-start gap-3 w-full min-w-0">
              <AlignLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground">Note</span>
                <span className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{transaction.note}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            variant="outline" 
            className="w-full sm:flex-1"
            onClick={() => {
              onOpenChange(false);
              onEdit(transaction);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button 
            variant="destructive" 
            className="w-full sm:flex-1"
            onClick={() => {
              onOpenChange(false);
              onDelete(transaction);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
