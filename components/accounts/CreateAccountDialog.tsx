"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { createAccount } from "@/app/actions/accounts";
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
import { IconPicker } from "@/components/ui/icon-picker";

const ACCOUNT_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "savings", label: "Savings" },
  { value: "e_wallet", label: "E-Wallet" },
  { value: "custom", label: "Custom" },
];

const CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "PHP"
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full mt-4" disabled={pending}>
      {pending ? "Creating..." : "Create Account"}
    </Button>
  );
}

interface CreateAccountDialogProps {
  baseCurrency: string;
}

export function CreateAccountDialog({ baseCurrency }: CreateAccountDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = React.useActionState(createAccount, null);
  const [icon, setIcon] = React.useState<string>("Wallet");

  // Close dialog on success
  React.useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button>Add Account</Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>
            Add a new financial account to track your balances.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4 mt-4">
          <input type="hidden" name="icon" value={icon} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" name="name" placeholder="e.g. Main Checking" required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Account Type</Label>
            <select
              id="type"
              name="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              defaultValue="cash"
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              name="currency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              defaultValue={baseCurrency || "USD"}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Currency cannot be changed after creation.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Icon (Optional)</Label>
            <IconPicker value={icon} onChange={setIcon} className="w-full" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="initial_balance">Initial Balance (Optional)</Label>
            <Input id="initial_balance" name="initial_balance" type="number" step="0.01" min="0" placeholder="0.00" />
            <p className="text-xs text-muted-foreground">
              If greater than zero, an initial income transaction will be created.
            </p>
          </div>

          {state?.error && (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          )}

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
