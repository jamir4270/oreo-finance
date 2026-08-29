"use client";

import * as React from "react";
import { MoreVertical, Archive, ArchiveRestore, Pencil } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveAccount, restoreAccount } from "@/app/actions/accounts";
import { AccountData } from "./EditAccountDialog";

interface AccountCardProps {
  account: AccountData & { archived_at: string | null };
  onEdit: (account: AccountData) => void;
}

export function AccountCard({ account, onEdit }: AccountCardProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleArchiveToggle = () => {
    startTransition(async () => {
      if (account.archived_at) {
        await restoreAccount(account.id);
      } else {
        await archiveAccount(account.id);
      }
    });
  };

  const Icon = account.icon ? (LucideIcons as any)[account.icon] : LucideIcons.Wallet;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-oreo-lavender/50 text-oreo-slate-purple">
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-heading text-lg font-medium text-foreground">
              {account.name}
            </h3>
            <p className="text-xs text-muted-foreground capitalize">
              {account.type.replace("_", " ")}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          } />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(account)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleArchiveToggle}
              disabled={isPending}
              className={account.archived_at ? "text-primary" : "text-destructive"}
            >
              {account.archived_at ? (
                <>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Restore Account
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Account
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Current Balance
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            0.00
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {account.currency}
          </span>
        </div>
      </div>
    </div>
  );
}
