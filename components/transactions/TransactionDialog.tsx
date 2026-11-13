"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createTransaction, updateTransaction } from "@/app/actions/transactions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, MoneyInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { convertCurrency, CURRENCIES } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { QuickLogFields } from "./QuickLogFields";

export type TxnAccountData = { id: string; name: string; currency: string };
export type TxnCategoryData = { id: string; name: string; icon: string; txn_type: string };
export type TransactionData = {
  id: string;
  type: string;
  amount: number;
  account_id: string;
  category_id: string;
  txn_date: string;
  note: string | null;
  account?: { name: string; currency: string };
  category?: { name: string; icon: string; txn_type: string };
  to_account_id?: string | null;
  to_amount?: number | null;
  exchange_rate?: number | null;
  to_account?: { name: string; currency: string };
  original_amount?: number | null;
  original_currency?: string | null;
};

interface TransactionDialogProps {
  transaction?: TransactionData;
  accounts: TxnAccountData[];
  categories: TxnCategoryData[];
  exchangeRates?: Record<string, number>;
  isStale?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
}

// Remembers the last account and per-type category on this device so a typical log is
// amount → Save. Storage can be unavailable (private mode), so failures are ignored.
const LAST_USED_KEY = "oreo:last-used";
type LastUsed = { account?: string; category?: Record<string, string> };
function readLastUsed(): LastUsed {
  try {
    return JSON.parse(localStorage.getItem(LAST_USED_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeLastUsed(formData: FormData) {
  try {
    const prev = readLastUsed();
    const type = formData.get("type") as string;
    localStorage.setItem(
      LAST_USED_KEY,
      JSON.stringify({ account: formData.get("account_id"), category: { ...prev.category, [type]: formData.get("category_id") } })
    );
  } catch {
    // per-device convenience only
  }
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full mt-4" disabled={pending}>
      {pending ? "Saving..." : isEdit ? "Save Changes" : "Log Transaction"}
    </Button>
  );
}

export function TransactionDialog({
  transaction,
  accounts,
  categories,
  exchangeRates,
  isStale,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: TransactionDialogProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setUncontrolledOpen;

  const isEdit = !!transaction;

  const [type, setType] = React.useState<string>(transaction?.type || "expense");
  const [amountStr, setAmountStr] = React.useState<string>(transaction?.original_amount?.toString() || transaction?.amount?.toString() || "");
  const [accountId, setAccountId] = React.useState<string>(transaction?.account_id || (accounts[0]?.id || ""));
  const [toAccountId, setToAccountId] = React.useState<string>(transaction?.to_account_id || "");
  const [inputCurrency, setInputCurrency] = React.useState<string>(transaction?.original_currency || accounts.find(a => a.id === (transaction?.account_id || accounts[0]?.id))?.currency || "USD");
  const [categoryId, setCategoryId] = React.useState<string>(transaction?.category_id || "");

  // Phones get the keypad-first quick log for new entries; edits and desktop keep the full form.
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const quick = !isDesktop && !isEdit;

  const changeType = (next: string) => {
    setType(next);
    setCategoryId(readLastUsed().category?.[next] || "");
  };

  const actionWithId = transaction ? updateTransaction.bind(null, transaction.id) : createTransaction;
  const [state, formAction] = useActionState(actionWithId, null);

  // New transactions submit optimistically: the sheet closes at once and saves in the background.
  // On failure it reopens pre-filled from `draft`, so nothing typed is lost.
  // Edits wait for the server: closing clears the parent's editing target, so they couldn't reopen.
  const [draft, setDraft] = React.useState<FormData | null>(null);
  const inFlightRef = React.useRef<FormData | null>(null);
  const toastIdRef = React.useRef<string | number | undefined>(undefined);
  const lastFiredStateRef = React.useRef(state);

  const submit = (formData: FormData) => {
    inFlightRef.current = formData;
    if (!isEdit) {
      writeLastUsed(formData);
      setDraft(null);
      setOpen(false);
      toastIdRef.current = toast.loading("Saving transaction...");
    }
    formAction(formData);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setDraft(null); // user dismissed: drop any failed draft
    setOpen(next);
  };

  React.useEffect(() => {
    if (!state || state === lastFiredStateRef.current) return;
    lastFiredStateRef.current = state;
    const id = toastIdRef.current;
    const submitted = inFlightRef.current;
    inFlightRef.current = null;
    if (state.success) {
      if (isEdit) setOpen(false);
      toast.success(isEdit ? "Transaction updated" : "Transaction added", {
        id,
        description: submitted ? `${submitted.get("input_amount")} ${submitted.get("type")}` : undefined,
      });
      if (state.warning) {
        // Slight delay so it doesn't overlap the success toast
        setTimeout(() => {
          toast.warning(state.warning);
        }, 300);
      }
    } else if (state.error && !isEdit && submitted) {
      toast.error("Couldn't save transaction", { id, description: state.error });
      setDraft(submitted);
      setType(submitted.get("type") as string);
      setAmountStr(submitted.get("input_amount") as string);
      setAccountId(submitted.get("account_id") as string);
      setToAccountId((submitted.get("to_account_id") as string | null) || "");
      setInputCurrency(submitted.get("input_currency") as string);
      setCategoryId(submitted.get("category_id") as string);
      setOpen(true);
    }
  }, [state, setOpen, isEdit]);

  React.useEffect(() => {
    if (draft) return; // reopened after a failed save: keep what the user entered
    if (open && transaction) {
      setType(transaction.type);
      setAccountId(transaction.account_id);
      setToAccountId(transaction.to_account_id || "");
      setCategoryId(transaction.category_id);
      
      const acc = accounts.find(a => a.id === transaction.account_id);
      setInputCurrency(transaction.original_currency || acc?.currency || accounts[0]?.currency || "USD");
      setAmountStr(transaction.original_amount?.toString() || transaction.amount.toString());
    } else if (open && !transaction) {
      const last = readLastUsed();
      const account = accounts.find((a) => a.id === last.account) ?? accounts[0];
      setType("expense");
      setAccountId(account?.id || "");
      setToAccountId("");
      setInputCurrency(account?.currency || "USD");
      setCategoryId(last.category?.expense || "");
      setAmountStr("");
    }
  }, [open, transaction, accounts, draft]);

  const draftValue = (name: string) => (draft?.get(name) as string | null) ?? undefined;

  const filteredCategories = categories.filter((c) => c.txn_type === type);
  // Fall back to the first category of this type if the remembered one is gone or doesn't match.
  const effectiveCategoryId = filteredCategories.some((c) => c.id === categoryId)
    ? categoryId
    : filteredCategories[0]?.id || "";

  // Transfer multi-currency math
  const sourceAccount = accounts.find((a) => a.id === accountId);
  const destAccount = accounts.find((a) => a.id === toAccountId);
  let convertedAmountStr = "";
  let exchangeRateStr = "";

  if (type === "transfer" && sourceAccount && destAccount && exchangeRates) {
    if (sourceAccount.currency !== destAccount.currency) {
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        const to_amount = convertCurrency(amount, sourceAccount.currency, destAccount.currency, exchangeRates);
        const rate = exchangeRates[destAccount.currency] / exchangeRates[sourceAccount.currency];
        convertedAmountStr = `≈ ${to_amount.toFixed(2)} ${destAccount.currency}`;
        exchangeRateStr = `1 ${sourceAccount.currency} = ${rate.toFixed(4)} ${destAccount.currency}`;
      }
    }
  } else if (type !== "transfer" && sourceAccount && exchangeRates && inputCurrency !== sourceAccount.currency) {
    const amount = parseFloat(amountStr);
    if (!isNaN(amount) && amount > 0) {
      const to_amount = convertCurrency(amount, inputCurrency, sourceAccount.currency, exchangeRates);
      const rate = exchangeRates[sourceAccount.currency] / exchangeRates[inputCurrency];
      convertedAmountStr = `≈ ${to_amount.toFixed(2)} ${sourceAccount.currency}`;
      exchangeRateStr = `1 ${inputCurrency} = ${rate.toFixed(4)} ${sourceAccount.currency}`;
    }
  }

  return (
    <ResponsiveSheet 
      open={open} 
      onOpenChange={handleOpenChange}
      trigger={trigger}
      title={isEdit ? "Edit Transaction" : quick ? "New Transaction" : "Log Transaction"}
      description={quick ? undefined : isEdit ? "Update the details of your transaction." : "Add a new expense, income or transfer."}
    >
      <form key={transaction?.id || "new"} action={submit} className="flex flex-col gap-4 mt-2">
        {quick ? (
          <QuickLogFields
            type={type}
            onTypeChange={changeType}
            amountStr={amountStr}
            onAmountChange={setAmountStr}
            inputCurrency={inputCurrency}
            onCurrencyChange={setInputCurrency}
            accounts={accounts}
            accountId={accountId}
            onAccountChange={(id) => {
              setAccountId(id);
              setInputCurrency(accounts.find((a) => a.id === id)?.currency ?? inputCurrency);
            }}
            toAccountId={toAccountId}
            onToAccountChange={setToAccountId}
            categories={filteredCategories}
            categoryId={effectiveCategoryId}
            onCategoryChange={setCategoryId}
            defaultDate={draftValue("txn_date") ?? new Date().toISOString().split("T")[0]}
            defaultNote={draftValue("note")}
            convertedAmountStr={convertedAmountStr}
            error={state?.error}
          />
        ) : (
        <>
          {/* Type Selector Tiles */}
          <div className="w-full">
            {isEdit ? (
              <div className="flex w-full items-center justify-center p-3 rounded-xl border border-border bg-muted/30">
                <span className="font-medium capitalize text-foreground">{type}</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => changeType('expense')}
                  className={cn("flex flex-col items-center justify-center py-3 rounded-xl border transition-all text-sm font-medium", type === 'expense' ? "border-[#fbe3e6] bg-[#fbe3e6]/40 text-[#a76571] shadow-sm" : "border-border bg-card text-muted-foreground hover:bg-muted/50")}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => changeType('income')}
                  className={cn("flex flex-col items-center justify-center py-3 rounded-xl border transition-all text-sm font-medium", type === 'income' ? "border-[#dff2ef] bg-[#dff2ef]/50 text-[#5f8f8a] shadow-sm" : "border-border bg-card text-muted-foreground hover:bg-muted/50")}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => changeType('transfer')}
                  className={cn("flex flex-col items-center justify-center py-3 rounded-xl border transition-all text-sm font-medium", type === 'transfer' ? "border-oreo-lavender bg-oreo-lavender/30 text-oreo-slate-purple shadow-sm" : "border-border bg-card text-muted-foreground hover:bg-muted/50")}
                >
                  Transfer
                </button>
              </div>
            )}
            <input type="hidden" name="type" value={type} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="input_amount">Amount</Label>
            <div className="flex gap-2">
              <select
                id="input_currency"
                name="input_currency"
                value={inputCurrency}
                onChange={(e) => setInputCurrency(e.target.value)}
                className="flex h-10 pointer-coarse:h-11 w-[76px] rounded-md border border-input bg-background px-2 py-2 text-base pointer-fine:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
              <MoneyInput
                id="input_amount"
                name="input_amount"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                className="flex-1 h-10 pointer-coarse:h-11 font-medium tabular-nums"
              />
            </div>
          </div>

          <div className={`grid ${type === 'transfer' ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-4'}`}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="account_id">Account</Label>
              <select
                id="account_id"
                name="account_id"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="flex h-10 pointer-coarse:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base pointer-fine:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
              </select>
            </div>

            {type !== "transfer" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="category_id">Category</Label>
                <select
                  id="category_id"
                  name="category_id"
                  value={effectiveCategoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-10 pointer-coarse:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base pointer-fine:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {type === "transfer" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="to_account_id">Destination Account</Label>
                <select
                  id="to_account_id"
                  name="to_account_id"
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="flex h-10 pointer-coarse:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base pointer-fine:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required={type === "transfer"}
                >
                  <option value="" disabled>Select destination...</option>
                  {accounts.filter(a => a.id !== accountId).map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currency})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {type === "transfer" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="category_id">Category</Label>
              <select
                id="category_id"
                name="category_id"
                value={effectiveCategoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 pointer-coarse:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base pointer-fine:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {convertedAmountStr && (
            <div className="flex flex-col gap-1 rounded-md bg-muted p-3 text-sm">
              <div className="font-medium text-foreground">Converted Amount: {convertedAmountStr}</div>
              <div className="text-muted-foreground text-xs">{exchangeRateStr}</div>
              {isStale && (
                <div className="text-amber-600 text-xs mt-1">Rate may be up to a day old</div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="txn_date">Date</Label>
            <Input
              id="txn_date"
              name="txn_date"
              type="date"
              defaultValue={
                draftValue("txn_date") ??
                (transaction?.txn_date
                  ? transaction.txn_date
                  : new Date().toISOString().split("T")[0])
              }
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="What was this for?"
              defaultValue={draftValue("note") ?? (transaction?.note || "")}
              className="resize-none w-full break-words whitespace-pre-wrap"
              rows={2}
            />
          </div>

          {state?.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}

          <SubmitButton isEdit={isEdit} />
        </>
        )}
        </form>
    </ResponsiveSheet>
  );
}
