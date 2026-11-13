"use client";

import * as React from "react";
import { PageTitle } from "@/components/layout/nav-title";
import { BudgetCard, BudgetCardData } from "./BudgetCard";
import { BudgetDetailDialog } from "./BudgetDetailDialog";
import { CreateBudgetDialog, BudgetCategoryData } from "./CreateBudgetDialog";
import { EditBudgetDialog } from "./EditBudgetDialog";
import { deleteBudget } from "@/app/actions/budgets";
import { ConfirmDestructive } from "@/components/ui/confirm-destructive";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [periodFilter, setPeriodFilter] = React.useState<string>("all");

  const existingCategoryIds = budgets.map((b) => b.category_id);


  // Filter and sort budgets
  const filteredBudgets = budgets.filter((b) => {
    if (periodFilter === "all") return true;
    return b.period_type === periodFilter;
  });

  const sortedBudgets = [...filteredBudgets].sort((a, b) => {
    const nameA = a.category?.name || "";
    const nameB = b.category?.name || "";
    return nameA.localeCompare(nameB);
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1">
          <PageTitle>Budgets</PageTitle>
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
        {budgets.length > 0 && (
          <div className="mb-4 flex justify-center sm:justify-start">
            <Tabs value={periodFilter} onValueChange={setPeriodFilter} className="w-full max-w-full overflow-x-auto text-center sm:text-left">
              <TabsList className="inline-flex w-max sm:w-fit mx-auto sm:mx-0">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center mt-8">
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              No budgets yet — set one up to start tracking your spending limits.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>Add Budget</Button>
          </div>
        ) : sortedBudgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center mt-8">
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              No {periodFilter} budgets found.
            </p>
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
      <ConfirmDestructive
        open={!!deletingBudget}
        onOpenChange={(open) => {
          if (!open) setDeletingBudget(null);
        }}
        title="Delete this budget?"
        description="This permanently deletes the budget and its period history. Your transactions are not affected."
        confirmLabel="Delete Budget"
        successMessage="Budget deleted"
        onConfirm={() => (deletingBudget ? deleteBudget(deletingBudget.id) : undefined)}
      />
    </>
  );
}
