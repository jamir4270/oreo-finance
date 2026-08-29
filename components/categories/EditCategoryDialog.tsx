"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateCategory } from "@/app/actions/categories";
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full mt-4" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

export type CategoryData = {
  id: string;
  name: string;
  txn_type: string;
  icon: string;
  is_default: boolean;
};

interface EditCategoryDialogProps {
  category: CategoryData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCategoryDialog({ category, open, onOpenChange }: EditCategoryDialogProps) {
  const updateCategoryWithId = category ? updateCategory.bind(null, category.id) : null;
  
  const [state, formAction] = useActionState(
    updateCategoryWithId || (async () => null),
    null
  );

  const [icon, setIcon] = React.useState<string>("Wallet");

  React.useEffect(() => {
    if (category) {
      setIcon(category.icon || "Wallet");
    }
  }, [category]);

  React.useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the details of your category.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4 mt-4">
          <input type="hidden" name="icon" value={icon} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" name="name" defaultValue={category.name} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Transaction Type</Label>
            <div className="relative">
              <Input value={category.txn_type.charAt(0).toUpperCase() + category.txn_type.slice(1)} disabled className="pl-10 capitalize" />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Type cannot be changed after creation.
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
