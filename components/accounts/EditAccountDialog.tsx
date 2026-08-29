"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { updateAccount } from "@/app/actions/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconPicker } from "@/components/ui/icon-picker";
import { Lock } from "lucide-react";

const ACCOUNT_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "savings", label: "Savings" },
  { value: "e_wallet", label: "E-Wallet" },
  { value: "custom", label: "Custom" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full mt-4" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

export type AccountData = {
  id: string;
  name: string;
  type: string;
  currency: string;
  icon: string | null;
  balance: number;
};

interface EditAccountDialogProps {
  account: AccountData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAccountDialog({ account, open, onOpenChange }: EditAccountDialogProps) {
  // Bind the account ID to the server action
  const updateAccountWithId = account ? updateAccount.bind(null, account.id) : null;
  
  // We use a dummy action if account is null, since formAction requires a function
  const [state, formAction] = React.useActionState(
    updateAccountWithId || (async () => null),
    null
  );

  const [icon, setIcon] = React.useState<string>("Wallet");

  // Sync state when account changes
  React.useEffect(() => {
    if (account) {
      setIcon(account.icon || "Wallet");
    }
  }, [account]);

  // Close dialog on success
  React.useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update the details of your financial account.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4 mt-4">
          <input type="hidden" name="icon" value={icon} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" name="name" defaultValue={account.name} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Account Type</Label>
            <select
              id="type"
              name="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              defaultValue={account.type}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Currency</Label>
            <div className="relative">
              <Input value={account.currency} disabled className="pl-10" />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Currency cannot be changed after creation.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Icon</Label>
            <IconPicker value={icon} onChange={setIcon} className="w-full" />
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
