"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createTransaction, updateTransaction } from "@/app/actions/transactions";
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
  account?: { name: string };
  category?: { name: string; icon: string; txn_type: string };
};

interface TransactionDialogProps {
  transaction?: TransactionData;
  accounts: TxnAccountData[];
  categories: TxnCategoryData[];
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

  const actionWithId = transaction ? updateTransaction.bind(null, transaction.id) : createTransaction;
  const [state, formAction] = useActionState(actionWithId, null);

  React.useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state, setOpen]);

  React.useEffect(() => {
    if (open && transaction) {
      setType(transaction.type);
    } else if (open && !transaction) {
      setType("expense");
    }
  }, [open, transaction]);

  const filteredCategories = categories.filter((c) => c.txn_type === type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Transaction" : "Log Transaction"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details of your transaction." : "Add a new expense or income to your ledger."}
          </DialogDescription>
        </DialogHeader>

        <form key={transaction?.id || "new"} action={formAction} className="flex flex-col gap-4 mt-2">
          {/* Type Selector Tabs */}
          <Tabs value={type} onValueChange={setType} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Expense</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
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
              defaultValue={transaction?.amount}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="account_id">Account</Label>
              <select
                id="account_id"
                name="account_id"
                defaultValue={transaction?.account_id || (accounts[0]?.id || "")}
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
          </div>

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
