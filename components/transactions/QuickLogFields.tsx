"use client";

import * as React from "react";
import { localDay } from "@/lib/dates";
import { Calendar, ChevronDown, Delete, NotebookPen, Wallet, ArrowRight, Repeat } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { DynamicIcon } from "@/lib/icons";
import { applyKey, type KeypadKey } from "@/lib/keypad";
import { CURRENCIES, currencyDecimals } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { TxnAccountData, TxnCategoryData } from "./TransactionDialog";

type TxnType = "expense" | "income" | "transfer";

interface QuickLogFieldsProps {
  type: string;
  onTypeChange: (type: string) => void;
  amountStr: string;
  onAmountChange: (amount: string) => void;
  inputCurrency: string;
  onCurrencyChange: (currency: string) => void;
  accounts: TxnAccountData[];
  accountId: string;
  onAccountChange: (id: string) => void;
  toAccountId: string;
  onToAccountChange: (id: string) => void;
  categories: TxnCategoryData[];
  categoryId: string;
  onCategoryChange: (id: string) => void;
  defaultDate: string;
  defaultNote?: string;
  defaultRepeat?: string;
  convertedAmountStr?: string;
  error?: string;
}

const TYPE_OPTIONS: { value: TxnType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "transfer", label: "Transfer" },
];

const REPEAT_LABELS: Record<string, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" };

const KEYS: KeypadKey[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

const amountTint: Record<string, string> = {
  expense: "text-oreo-mauve",
  income: "text-oreo-dusty-teal",
  transfer: "text-oreo-slate-purple",
};

/** Native <select>/<input> laid invisibly over a pill: tapping opens the iOS picker wheel. */
function PickerPill({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="relative flex h-9 min-w-0 items-center gap-1.5 rounded-full bg-foreground/[0.06] px-3 text-[14px] font-medium text-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
      {icon}
      <span className="truncate">{label}</span>
      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.5} aria-hidden />
      {children}
    </div>
  );
}

const overlay = "absolute inset-0 h-full w-full cursor-pointer opacity-0";

/**
 * Keypad-first entry for phones (Apple Cash style): big amount, custom keypad so the
 * system keyboard never covers the sheet, category chips, compact pickers.
 * All values reach the server action through named form fields, same as the classic form.
 */
export function QuickLogFields(props: QuickLogFieldsProps) {
  const {
    type, onTypeChange, amountStr, onAmountChange, inputCurrency, onCurrencyChange,
    accounts, accountId, onAccountChange, toAccountId, onToAccountChange,
    categories, categoryId, onCategoryChange, defaultDate, defaultNote, defaultRepeat, convertedAmountStr, error,
  } = props;

  const [date, setDate] = React.useState(defaultDate);
  const [showNote, setShowNote] = React.useState(!!defaultNote);
  const [repeat, setRepeat] = React.useState(defaultRepeat ?? "never");
  const decimals = currencyDecimals(inputCurrency);
  const isTransfer = type === "transfer";
  const account = accounts.find((a) => a.id === accountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);
  const amount = parseFloat(amountStr);
  const canSave = amount > 0 && !!accountId && !!categoryId && (!isTransfer || !!toAccountId);

  const today = localDay();
  const dateLabel =
    date === today
      ? "Today"
      : new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  // Shrink long amounts so they never wrap, like the Calculator display.
  const display = amountStr || "0";
  const sizeClass = display.length > 9 ? "text-[38px]" : display.length > 6 ? "text-[48px]" : "text-[60px]";

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl id="txn-type" value={type as TxnType} onChange={onTypeChange} options={TYPE_OPTIONS} />

      {/* Amount */}
      <div className="flex flex-col items-center pt-1">
        <div className="relative mb-1">
          <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-semibold text-muted-foreground">
            {inputCurrency}
            <ChevronDown className="size-3.5" strokeWidth={2.5} aria-hidden />
          </span>
          <select
            aria-label="Currency"
            value={inputCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className={overlay}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
            ))}
          </select>
        </div>
        <output
          aria-live="polite"
          aria-label={`Amount ${display} ${inputCurrency}`}
          className={cn(
            "font-semibold leading-none tracking-tight tabular-nums transition-[font-size] duration-150",
            sizeClass,
            amountStr ? amountTint[type] : "text-foreground/25"
          )}
        >
          {display}
        </output>
        <p className="mt-1.5 h-4 text-[13px] text-muted-foreground tabular-nums">{convertedAmountStr}</p>
      </div>

      {/* Category chips */}
      {categories.length > 0 ? (
        <div role="radiogroup" aria-label="Category" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] snap-x">
          {categories.map((cat) => {
            const selected = cat.id === categoryId;
            return (
              <button
                key={cat.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onCategoryChange(cat.id)}
                className="flex w-[68px] shrink-0 snap-start flex-col items-center gap-1.5 transition-transform duration-150 active:scale-95"
              >
                <span
                  className={cn(
                    "flex size-12 items-center justify-center rounded-2xl transition-colors",
                    selected ? "bg-oreo-slate-purple text-white shadow-[0_4px_12px_rgba(86,86,118,0.3)]" : "bg-foreground/[0.06] text-foreground/70"
                  )}
                >
                  <DynamicIcon icon={cat.icon} className="size-[22px]" strokeWidth={selected ? 2.2 : 1.8} />
                </span>
                <span className={cn("w-full truncate text-center text-[11px]", selected ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-[13px] text-muted-foreground">No {type} categories yet. Add one in Categories.</p>
      )}

      {/* Account / date / note pickers */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <PickerPill icon={<Wallet className="size-4 shrink-0 text-muted-foreground" aria-hidden />} label={account?.name ?? "Account"}>
          <select aria-label={isTransfer ? "From account" : "Account"} value={accountId} onChange={(e) => onAccountChange(e.target.value)} className={overlay}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
            ))}
          </select>
        </PickerPill>

        {isTransfer && (
          <>
            <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
            <PickerPill icon={<Wallet className="size-4 shrink-0 text-muted-foreground" aria-hidden />} label={toAccount?.name ?? "To…"}>
              <select aria-label="To account" value={toAccountId} onChange={(e) => onToAccountChange(e.target.value)} className={overlay}>
                <option value="" disabled>Select destination…</option>
                {accounts.filter((a) => a.id !== accountId).map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                ))}
              </select>
            </PickerPill>
          </>
        )}

        <PickerPill icon={<Calendar className="size-4 shrink-0 text-muted-foreground" aria-hidden />} label={dateLabel}>
          <input type="date" aria-label="Date" name="txn_date" value={date} required onChange={(e) => e.target.value && setDate(e.target.value)} className={overlay} />
        </PickerPill>

        {!isTransfer && (
          <PickerPill
            icon={<Repeat className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
            label={repeat === "never" ? "Repeat" : REPEAT_LABELS[repeat]}
          >
            <select aria-label="Repeat" name="repeat" value={repeat} onChange={(e) => setRepeat(e.target.value)} className={overlay}>
            <option value="never">Never</option>
            <option value="daily">Every day</option>
            <option value="weekly">Every week</option>
            <option value="monthly">Every month</option>
            <option value="yearly">Every year</option>
            </select>
          </PickerPill>
        )}

        {!showNote && (
          <button
            type="button"
            onClick={() => setShowNote(true)}
            className="flex h-9 items-center gap-1.5 rounded-full bg-foreground/[0.06] px-3 text-[14px] font-medium text-foreground transition-opacity active:opacity-50"
          >
            <NotebookPen className="size-4 text-muted-foreground" aria-hidden />
            Note
          </button>
        )}
      </div>

      {showNote && (
        <input
          name="note"
          defaultValue={defaultNote}
          placeholder="What was this for?"
          aria-label="Note"
          autoFocus={!defaultNote}
          enterKeyHint="done"
          className="h-11 w-full rounded-xl bg-foreground/[0.06] px-4 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      )}

      {/* Values the server action reads */}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="input_amount" value={amountStr} />
      <input type="hidden" name="input_currency" value={inputCurrency} />
      <input type="hidden" name="account_id" value={accountId} />
      <input type="hidden" name="category_id" value={categoryId} />
      {isTransfer && <input type="hidden" name="to_account_id" value={toAccountId} />}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-1.5" aria-label="Amount keypad">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            aria-label={key === "back" ? "Delete" : key === "." ? "Decimal point" : key}
            disabled={key === "." && decimals === 0}
            onClick={() => onAmountChange(applyKey(amountStr, key, decimals))}
            className="flex h-[52px] items-center justify-center rounded-xl text-[26px] font-normal tabular-nums text-foreground transition-colors duration-75 select-none active:bg-foreground/[0.1] disabled:opacity-25"
          >
            {key === "back" ? <Delete className="size-6" strokeWidth={1.8} aria-hidden /> : key}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="text-center text-sm font-medium text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={!canSave}
        className="h-[52px] w-full rounded-2xl bg-oreo-slate-purple text-[17px] font-semibold text-white transition-[transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-35"
      >
        Save
      </button>
    </div>
  );
}
