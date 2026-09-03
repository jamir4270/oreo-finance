"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createTransaction, updateTransaction } from "@/app/actions/transactions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { convertCurrency } from "@/lib/currency";

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
};

interface TransactionDialogProps {
  transaction?: TransactionData;
  accounts: TxnAccountData[];
  categories: TxnCategoryData[];
  exchangeRates?: Record<string, number>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
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
  const [amountStr, setAmountStr] = React.useState<string>(transaction?.amount?.toString() || "");
  const [accountId, setAccountId] = React.useState<string>(transaction?.account_id || (accounts[0]?.id || ""));
  const [toAccountId, setToAccountId] = React.useState<string>(transaction?.to_account_id || "");

  const actionWithId = transaction ? updateTransaction.bind(null, transaction.id) : createTransaction;
  const [state, formAction] = useActionState(actionWithId, null);

  const lastFiredStateRef = React.useRef(state);

  React.useEffect(() => {
    if (state?.success && state !== lastFiredStateRef.current) {
      lastFiredStateRef.current = state;
      setOpen(false);
      toast.success(isEdit ? "Transaction updated" : "Transaction added", {
        description: `${amountStr} ${type}`,
        action: {
          label: "Undo",
          onClick: () => toast("Undo action will be processed"),
        }
      });
    }
  }, [state, setOpen, isEdit, amountStr, type]);

  React.useEffect(() => {
    if (open && transaction) {
      setType(transaction.type);
      setAmountStr(transaction.amount.toString());
      setAccountId(transaction.account_id);
      setToAccountId(transaction.to_account_id || "");
    } else if (open && !transaction) {
      setType("expense");
      setAmountStr("");
      setAccountId(accounts[0]?.id || "");
      setToAccountId("");
    }
  }, [open, transaction, accounts]);

  const filteredCategories = categories.filter((c) => c.txn_type === type);

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
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Transaction" : "Log Transaction"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details of your transaction." : "Add a new expense, income or transfer."}
          </DialogDescription>
        </DialogHeader>

        <form key={transaction?.id || "new"} action={formAction} className="flex flex-col gap-4 mt-2">
          {/* Type Selector Tabs */}
          <Tabs value={type} onValueChange={setType} className="w-full">
            {isEdit ? (
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value={type} disabled className="capitalize opacity-100 cursor-default">
                  {type}
                </TabsTrigger>
              </TabsList>
            ) : (
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="expense">Expense</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="transfer">Transfer</TabsTrigger>
              </TabsList>
            )}
            <input type="hidden" name="type" value={type} />
          </Tabs>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              required
            />
          </div>

          <div className={`grid ${type === 'transfer' ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-4'}`}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="account_id">Account</Label>
              <select
                id="account_id"
                name="account_id"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  defaultValue={transaction?.category_id || (filteredCategories[0]?.id || "")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                defaultValue={transaction?.category_id || (filteredCategories[0]?.id || "")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="txn_date">Date</Label>
            <Input
              id="txn_date"
              name="txn_date"
              type="date"
              defaultValue={
                transaction?.txn_date 
                  ? transaction.txn_date 
                  : new Date().toISOString().split("T")[0]
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
              defaultValue={transaction?.note || ""}
              className="resize-none w-full break-words whitespace-pre-wrap"
              rows={2}
            />
          </div>

          {state?.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}

          <SubmitButton isEdit={isEdit} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
