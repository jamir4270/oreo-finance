"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TransactionData, TxnAccountData, TxnCategoryData, TransactionDialog } from "./TransactionDialog";
import { TransactionDetailDialog } from "./TransactionDetailDialog";
import { TransactionCard } from "./TransactionCard";
import { deleteTransaction } from "@/app/actions/transactions";
import { toast } from "sonner";
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
import { Plus, ChevronLeft, ChevronRight, Calendar, Filter, Wallet, Tags } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface TransactionsPageClientProps {
  transactions: TransactionData[];
  accounts: TxnAccountData[];
  categories: TxnCategoryData[];
  exchangeRates?: Record<string, number>;
  isStale?: boolean;
  totalPages: number;
  currentPage: number;
  initialFilters: {
    type: string;
    account: string;
    category: string;
    dateRange: string;
  };
}

export function TransactionsPageClient({ 
  transactions, 
  accounts, 
  categories, 
  exchangeRates,
  isStale,
  totalPages,
  currentPage,
  initialFilters
}: TransactionsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [editingTxn, setEditingTxn] = React.useState<TransactionData | null>(null);
  const [viewingTxn, setViewingTxn] = React.useState<TransactionData | null>(null);
  const [deletingTxn, setDeletingTxn] = React.useState<TransactionData | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const filterType = initialFilters.type;
  const filterAccount = initialFilters.account;
  const filterCategory = initialFilters.category;
  const filterDateRange = initialFilters.dateRange;

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "all_time") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset to page 1 on filter change
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Group filtered transactions by date
  const groupedTransactions = transactions.reduce((groups, txn) => {
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
      toast.error(result.error);
    } else {
      const deletedAmount = deletingTxn.amount;
      setDeletingTxn(null);
      toast.success("Transaction deleted", {
        description: `Removed transaction of ${deletedAmount}`
      });
    }
  };

  const emptyStateJsx = (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center mt-8">
      <p className="text-sm text-muted-foreground max-w-xs mb-4">
        {transactions.length === 0 && Object.keys(initialFilters).every(k => initialFilters[k as keyof typeof initialFilters] === "all" || initialFilters[k as keyof typeof initialFilters] === "all_time")
          ? "No transactions yet — add your first one to start tracking your spending."
          : "No transactions match your current filters."}
      </p>
      {transactions.length === 0 && Object.keys(initialFilters).every(k => initialFilters[k as keyof typeof initialFilters] === "all" || initialFilters[k as keyof typeof initialFilters] === "all_time") && (
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
          isStale={isStale}
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          trigger={<Button><Plus className="mr-2 h-4 w-4" /> Add Transaction</Button>}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-row flex-wrap gap-2 md:gap-3 mt-6">
        <Select value={filterDateRange} onValueChange={(val) => updateFilter("dateRange", val || "all_time")}>
          <SelectTrigger className="w-auto md:w-[150px] capitalize px-3 md:px-3">
            <Calendar className="h-4 w-4 md:mr-2 shrink-0" />
            <span data-slot="select-value" className="hidden md:flex flex-1 text-left truncate">
              {
                filterDateRange === "last_30" ? "Last 30 Days" :
                filterDateRange === "this_month" ? "This Month" :
                filterDateRange === "last_month" ? "Last Month" :
                filterDateRange === "this_year" ? "This Year" :
                "All Time"
              }
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_time" label="All Time">All Time</SelectItem>
            <SelectItem value="last_30" label="Last 30 Days">Last 30 Days</SelectItem>
            <SelectItem value="this_month" label="This Month">This Month</SelectItem>
            <SelectItem value="last_month" label="Last Month">Last Month</SelectItem>
            <SelectItem value="this_year" label="This Year">This Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={(val) => updateFilter("type", val || "all")}>
          <SelectTrigger className="w-auto md:w-[150px] capitalize px-3 md:px-3">
            <Filter className="h-4 w-4 md:mr-2 shrink-0" />
            <span data-slot="select-value" className="hidden md:flex flex-1 text-left truncate">
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

        <Select value={filterAccount} onValueChange={(val) => updateFilter("account", val || "all")}>
          <SelectTrigger className="w-auto md:w-[180px] capitalize px-3 md:px-3">
            <Wallet className="h-4 w-4 md:mr-2 shrink-0" />
            <span data-slot="select-value" className="hidden md:flex flex-1 text-left truncate">
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

        <Select value={filterCategory} onValueChange={(val) => updateFilter("category", val || "all")}>
          <SelectTrigger className="w-auto md:w-[180px] capitalize px-3 md:px-3">
            <Tags className="h-4 w-4 md:mr-2 shrink-0" />
            <span data-slot="select-value" className="hidden md:flex flex-1 text-left truncate">
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

      <div className={`mt-6 flex-1 flex flex-col pb-10 transition-opacity duration-200 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {transactions.length === 0 ? (
          emptyStateJsx
        ) : (
          <div className="flex flex-col gap-8">
            {sortedDates.map((date) => {
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 border-t border-border pt-6 px-1">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4 sm:ml-1" />
                  </Button>
                </div>
              </div>
            )}
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
        isStale={isStale}
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
