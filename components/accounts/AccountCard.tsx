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
    <div className="flex items-center sm:flex-col sm:items-stretch justify-between rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md gap-4 sm:gap-0">
      <div className="flex items-center sm:items-start justify-between flex-1 sm:flex-none min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-oreo-lavender/50 text-oreo-slate-purple">
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-base sm:text-lg font-medium text-foreground truncate">
              {account.name}
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground capitalize truncate">
              {account.type.replace("_", " ")}
            </p>
          </div>
        </div>
        
        <div className="hidden sm:block">
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
      </div>

      <div className="flex items-center gap-3 sm:mt-6 sm:justify-start shrink-0">
        <div className="flex flex-col items-end sm:items-start">
          <p className="hidden sm:block text-sm font-medium text-muted-foreground mb-1">
            Current Balance
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-2xl font-semibold tracking-tight text-foreground">
              {account.balance.toFixed(2)}
            </span>
            <span className="text-[10px] sm:text-sm font-medium text-muted-foreground">
              {account.currency}
            </span>
          </div>
        </div>

        <div className="block sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
      </div>
    </div>
  );
}
