"use client";

import * as React from "react";
import { TransactionData, TxnAccountData, TxnCategoryData, TransactionDialog } from "./TransactionDialog";
import { TransactionDetailDialog } from "./TransactionDetailDialog";
import { TransactionCard } from "./TransactionCard";
import { deleteTransaction } from "@/app/actions/transactions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionsPageClientProps {
  transactions: TransactionData[];
  accounts: TxnAccountData[];
  categories: TxnCategoryData[];
  exchangeRates?: Record<string, number>;
}

export function TransactionsPageClient({ transactions, accounts, categories, exchangeRates }: TransactionsPageClientProps) {
  const [editingTxn, setEditingTxn] = React.useState<TransactionData | null>(null);
  const [viewingTxn, setViewingTxn] = React.useState<TransactionData | null>(null);
  const [deletingTxn, setDeletingTxn] = React.useState<TransactionData | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Filters state
  const [filterType, setFilterType] = React.useState<string>("all");
  const [filterAccount, setFilterAccount] = React.useState<string>("all");
  const [filterCategory, setFilterCategory] = React.useState<string>("all");

  // Apply filters
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((txn) => {
      if (filterType !== "all" && txn.type !== filterType) return false;
      if (filterAccount !== "all" && txn.account_id !== filterAccount && txn.to_account_id !== filterAccount) return false;
      if (filterCategory !== "all" && txn.category_id !== filterCategory) return false;
      return true;
    });
  }, [transactions, filterType, filterAccount, filterCategory]);

  // Group filtered transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, txn) => {
    const date = txn.txn_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(txn);
    return groups;
  }, {} as Record<string, TransactionData[]>);

  // Sort dates descending (newest first)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const handleDelete = async () => {
    if (!deletingTxn) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    const result = await deleteTransaction(deletingTxn.id);
    
    setIsDeleting(false);
    
    if (result?.error) {
      setDeleteError(result.error);
    } else {
      setDeletingTxn(null);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center mt-8">
      <p className="text-sm text-muted-foreground max-w-xs mb-4">
        {transactions.length === 0 
          ? "No transactions yet — add your first one to start tracking your spending."
          : "No transactions match your current filters."}
      </p>
      {transactions.length === 0 && (
        <Button onClick={() => setIsCreateOpen(true)}>Add Transaction</Button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-oreo-slate-purple">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage your ledger.
          </p>
        </div>
        
        <TransactionDialog
          accounts={accounts}
          categories={categories}
          exchangeRates={exchangeRates}
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          trigger={<Button><Plus className="mr-2 h-4 w-4" /> Add Transaction</Button>}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Select value={filterType} onValueChange={(val) => setFilterType(val || "all")}>
          <SelectTrigger className="w-full sm:w-[150px] capitalize">
            <span data-slot="select-value" className="flex flex-1 text-left truncate">
              {filterType === "all" ? "All Types" : filterType}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" label="All Types">All Types</SelectItem>
            <SelectItem value="expense" label="Expense">Expense</SelectItem>
            <SelectItem value="income" label="Income">Income</SelectItem>
            <SelectItem value="transfer" label="Transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterAccount} onValueChange={(val) => setFilterAccount(val || "all")}>
          <SelectTrigger className="w-full sm:w-[180px] capitalize">
            <span data-slot="select-value" className="flex flex-1 text-left truncate">
              {filterAccount === "all" ? "All Accounts" : accounts.find(a => a.id === filterAccount)?.name || "Account"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" label="All Accounts">All Accounts</SelectItem>
            {accounts.map(acc => (
              <SelectItem key={acc.id} value={acc.id} label={acc.name}>{acc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || "all")}>
          <SelectTrigger className="w-full sm:w-[180px] capitalize">
            <span data-slot="select-value" className="flex flex-1 text-left truncate">
              {filterCategory === "all" ? "All Categories" : categories.find(c => c.id === filterCategory)?.name || "Category"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" label="All Categories">All Categories</SelectItem>
            {categories
              .filter(cat => filterType === "all" || cat.txn_type === filterType)
              .map(cat => (
                <SelectItem key={cat.id} value={cat.id} label={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 flex-1">
        {filteredTransactions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-8">
            {sortedDates.map((date) => {
              // Format date nicely (e.g., Today, Yesterday, or Aug 29, 2026)
              const dateObj = new Date(date);
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              
              let dateString = dateObj.toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
              });

              if (date === today.toISOString().split("T")[0]) dateString = "Today";
              else if (date === yesterday.toISOString().split("T")[0]) dateString = "Yesterday";

              return (
                <div key={date} className="flex flex-col gap-3">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                    {dateString}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {groupedTransactions[date].map((txn) => (
                      <TransactionCard
                        key={txn.id}
                        transaction={txn}
                        onClick={setViewingTxn}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TransactionDetailDialog
        transaction={viewingTxn}
        open={!!viewingTxn}
        onOpenChange={(open) => {
          if (!open) setViewingTxn(null);
        }}
        onEdit={setEditingTxn}
        onDelete={setDeletingTxn}
      />

      <TransactionDialog
        transaction={editingTxn || undefined}
        accounts={accounts}
        categories={categories}
        exchangeRates={exchangeRates}
        open={!!editingTxn}
        onOpenChange={(open) => {
          if (!open) setEditingTxn(null);
        }}
      />

      <AlertDialog open={!!deletingTxn} onOpenChange={(open) => {
        if (!open && !isDeleting) {
          setDeletingTxn(null);
          setDeleteError(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction from your ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {deleteError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {deleteError}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
