"use client";

import * as React from "react";
import { MoreVertical, Trash2, Pencil } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionData } from "./TransactionDialog";
import { cn } from "@/lib/utils";

interface TransactionCardProps {
  transaction: TransactionData;
  onClick: (transaction: TransactionData) => void;
}

export function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  const isExpense = transaction.type === "expense";
  const isTransfer = transaction.type === "transfer";
  const iconName = transaction.category?.icon || "Tag";
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Tag;

  // Design Spec compliance for transaction colors
  const amountColor = isTransfer ? "text-foreground" : isExpense ? "text-oreo-mauve" : "text-oreo-dusty-teal";
  const prefix = isTransfer ? "" : isExpense ? "-" : "+";

  return (
    <div 
      onClick={() => onClick(transaction)}
      className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md cursor-pointer hover:border-muted-foreground/30 active:scale-[0.98]"
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        {/* Category Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-oreo-lavender/50 text-oreo-slate-purple">
          <Icon className="h-5 w-5" />
        </div>

        {/* Details */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-base font-medium text-foreground truncate">
              {transaction.category?.name || "Uncategorized"}
            </h3>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 overflow-hidden whitespace-nowrap">
            <span className="shrink-0">
              {transaction.account?.name || "Unknown Account"}
              {isTransfer && transaction.to_account?.name && ` → ${transaction.to_account.name}`}
            </span>
            {transaction.note && (
              <>
                <span className="shrink-0">•</span>
                <span>{transaction.note.length > 20 ? `${transaction.note.substring(0, 20)}...` : transaction.note}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 shrink-0 ml-4">
        {/* Amount */}
        <div className={cn("font-mono text-base font-semibold", amountColor)}>
          {prefix}{transaction.amount.toFixed(2)}
          {transaction.account?.currency && (
            <span className="ml-1 text-xs font-medium text-muted-foreground font-sans">
              {transaction.account.currency}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
