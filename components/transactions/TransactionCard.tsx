"use client";

import * as React from "react";
import { formatAmount } from "@/lib/currency";
import { animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { Trash2 } from "lucide-react";
import { DynamicIcon } from "@/lib/icons";
import { spring } from "@/lib/motion";
import { TransactionData } from "./TransactionDialog";
import { cn } from "@/lib/utils";

interface TransactionCardProps {
  transaction: TransactionData;
  onClick: (transaction: TransactionData) => void;
  /** Enables iOS swipe-to-delete. Deletion is also reachable from the detail sheet. */
  onDelete?: (transaction: TransactionData) => void;
}

const ACTION_WIDTH = 88;

export function TransactionCard({ transaction, onClick, onDelete }: TransactionCardProps) {
  const isExpense = transaction.type === "expense";
  const isTransfer = transaction.type === "transfer";

  // Design Spec compliance for transaction colors
  const amountColor = isTransfer ? "text-foreground" : isExpense ? "text-oreo-mauve" : "text-oreo-dusty-teal";
  const prefix = isTransfer ? "" : isExpense ? "-" : "+";

  const rowRef = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  // The red action only shows once the row moves, so it never peeks past rounded corners.
  const actionOpacity = useTransform(x, [-24, 0], [1, 0]);
  const [revealed, setRevealed] = React.useState(false);

  const settle = (to: number) => {
    animate(x, to, spring.snappy);
    setRevealed(to !== 0);
  };

  const commitDelete = () => {
    const width = rowRef.current?.offsetWidth ?? 400;
    animate(x, -width, spring.snappy);
    onDelete?.(transaction);
  };

  // Like UITableView: past half the width (or a fast flick) deletes; past half the
  // button snaps open; anything less springs back.
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const width = rowRef.current?.offsetWidth ?? 400;
    const offset = x.get();
    if (offset < -width * 0.5 || (info.velocity.x < -900 && offset < -ACTION_WIDTH / 2)) commitDelete();
    else if (offset < -ACTION_WIDTH / 2) settle(-ACTION_WIDTH);
    else settle(0);
  };

  const open = () => {
    if (revealed) settle(0); // first tap on an open row just closes it
    else onClick(transaction);
  };

  return (
    <div ref={rowRef} className="relative overflow-hidden rounded-xl">
      {onDelete && (
        <motion.button
          type="button"
          // Swipe is a touch shortcut; keyboard and screen-reader users delete from the detail sheet.
          aria-hidden
          tabIndex={-1}
          style={{ opacity: actionOpacity }}
          onClick={commitDelete}
          className="absolute inset-0 flex items-center justify-end bg-destructive pr-7 text-white"
        >
          <span className="flex flex-col items-center gap-0.5 text-[12px] font-medium">
            <Trash2 className="size-5" strokeWidth={2} />
            Delete
          </span>
        </motion.button>
      )}

      <motion.div
        drag={onDelete ? "x" : false}
        dragDirectionLock
        dragConstraints={{ left: -2000, right: 0 }}
        dragElastic={{ left: 0.08, right: 0 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onTap={open}
        style={{ x, touchAction: "pan-y" }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(transaction);
          }
        }}
        className="relative flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm transition-[box-shadow,border-color] hover:border-muted-foreground/30 hover:shadow-oreo-sm"
        role="button"
        tabIndex={0}
        aria-label={`${transaction.category?.name || "Uncategorized"}, ${prefix}${formatAmount(transaction.amount, transaction.account?.currency ?? "")} ${transaction.account?.currency ?? ""}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Category Icon */}
          <div className="flex shrink-0 items-center justify-center text-oreo-slate-purple">
            <DynamicIcon icon={transaction.category?.icon} className="h-4 w-4" />
          </div>

          {/* Details */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-sm font-medium text-foreground truncate">
                {transaction.category?.name || "Uncategorized"}
              </h3>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 overflow-hidden whitespace-nowrap">
              <span className="shrink-0">
                {transaction.account?.name || "Unknown Account"}
                {isTransfer && transaction.to_account?.name && ` → ${transaction.to_account.name}`}
              </span>
              {transaction.note && (
                <>
                  <span className="shrink-0">•</span>
                  <span className="truncate">{transaction.note}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4">
          {/* Amount */}
          <div className={cn("font-mono text-sm font-semibold tabular-nums", amountColor)}>
            {prefix}{formatAmount(transaction.amount, transaction.account?.currency ?? "")}
            {transaction.account?.currency && (
              <span className="ml-1 text-[10px] font-medium text-muted-foreground font-sans">
                {transaction.account.currency}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
