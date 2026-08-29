"use client";

import * as React from "react";
import { BudgetCard, BudgetCardData } from "./BudgetCard";
import { BudgetDetailDialog } from "./BudgetDetailDialog";
import { CreateBudgetDialog, BudgetCategoryData } from "./CreateBudgetDialog";
import { EditBudgetDialog } from "./EditBudgetDialog";
import { deleteBudget } from "@/app/actions/budgets";
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
import { Plus } from "lucide-react";

interface BudgetsPageClientProps {
  budgets: BudgetCardData[];
  categories: BudgetCategoryData[];
  baseCurrency: string;
}

export function BudgetsPageClient({ budgets, categories, baseCurrency }: BudgetsPageClientProps) {
  const [viewingBudget, setViewingBudget] = React.useState<BudgetCardData | null>(null);
  const [editingBudget, setEditingBudget] = React.useState<BudgetCardData | null>(null);
  const [deletingBudget, setDeletingBudget] = React.useState<BudgetCardData | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const existingCategoryIds = budgets.map((b) => b.category_id);

  const handleDelete = async () => {
    if (!deletingBudget) return;

    setIsDeleting(true);
    setDeleteError(null);

    const result = await deleteBudget(deletingBudget.id);

    setIsDeleting(false);

    if (result?.error) {
      setDeleteError(result.error);
    } else {
      setDeletingBudget(null);
    }
  };

  // Sort budgets by category name
  const sortedBudgets = [...budgets].sort((a, b) => {
    const nameA = a.category?.name || "";
    const nameB = b.category?.name || "";
    return nameA.localeCompare(nameB);
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-oreo-slate-purple">
            Budgets
          </h1>
          <p className="text-sm text-muted-foreground">
            Plan your spending and track budget progress.
          </p>
        </div>

        <CreateBudgetDialog
          categories={categories}
          existingCategoryIds={existingCategoryIds}
          baseCurrency={baseCurrency}
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          trigger={<Button><Plus className="mr-2 h-4 w-4" /> Add Budget</Button>}
        />
      </div>

      <div className="mt-6 flex-1">
        {sortedBudgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center mt-8">
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              No budgets yet — set one up to start tracking your spending limits.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>Add Budget</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sortedBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                baseCurrency={baseCurrency}
                onClick={setViewingBudget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <BudgetDetailDialog
        budget={viewingBudget}
        baseCurrency={baseCurrency}
        open={!!viewingBudget}
        onOpenChange={(open) => {
          if (!open) setViewingBudget(null);
        }}
        onEdit={setEditingBudget}
        onDelete={setDeletingBudget}
      />

      {/* Edit Dialog */}
      {editingBudget && (
        <EditBudgetDialog
          budget={editingBudget}
          baseCurrency={baseCurrency}
          open={!!editingBudget}
          onOpenChange={(open) => {
            if (!open) setEditingBudget(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingBudget} onOpenChange={(open) => {
        if (!open && !isDeleting) {
          setDeletingBudget(null);
          setDeleteError(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this budget and all its period history. Your transactions will not be affected.
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
