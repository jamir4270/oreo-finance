"use client";

import * as React from "react";
import { PageTitle } from "@/components/layout/nav-title";
import { CategoryData, EditCategoryDialog } from "./EditCategoryDialog";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { CategoryCard } from "./CategoryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteCategory } from "@/app/actions/categories";
import { ConfirmDestructive } from "@/components/ui/confirm-destructive";
interface CategoriesPageClientProps {
  categories: CategoryData[];
}

export function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  const [editingCategory, setEditingCategory] = React.useState<CategoryData | null>(null);
  const [deletingCategory, setDeletingCategory] = React.useState<CategoryData | null>(null);

  const expenses = categories.filter(c => c.txn_type === "expense");
  const incomes = categories.filter(c => c.txn_type === "income");
  const transfers = categories.filter(c => c.txn_type === "transfer");


  const EmptyState = ({ type }: { type: string }) => (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
      <p className="text-sm text-muted-foreground max-w-xs">
        You don't have any {type} categories yet. Click "Add Category" to get started.
      </p>
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1">
          <PageTitle>Categories</PageTitle>
          <p className="text-sm text-muted-foreground">
            Manage your transaction categories and icons.
          </p>
        </div>
        <CreateCategoryDialog />
      </div>

      <div className="mt-8 flex-1">
        <Tabs defaultValue="expense" className="w-full">
          <TabsList className="mb-6 w-full sm:w-[400px] grid grid-cols-3">
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="expense" className="mt-0">
            {expenses.length === 0 ? <EmptyState type="expense" /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenses.map((category) => (
                  <CategoryCard 
                    key={category.id} 
                    category={category} 
                    onEdit={setEditingCategory} 
                    onDelete={setDeletingCategory}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="income" className="mt-0">
            {incomes.length === 0 ? <EmptyState type="income" /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomes.map((category) => (
                  <CategoryCard 
                    key={category.id} 
                    category={category} 
                    onEdit={setEditingCategory} 
                    onDelete={setDeletingCategory}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transfer" className="mt-0">
            {transfers.length === 0 ? <EmptyState type="transfer" /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transfers.map((category) => (
                  <CategoryCard 
                    key={category.id} 
                    category={category} 
                    onEdit={setEditingCategory} 
                    onDelete={setDeletingCategory}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EditCategoryDialog 
        category={editingCategory} 
        open={!!editingCategory} 
        onOpenChange={React.useCallback((open: boolean) => {
          if (!open) setEditingCategory(null);
        }, [])} 
      />

      <ConfirmDestructive
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        title="Delete this category?"
        description={`"${deletingCategory?.name ?? ""}" will be permanently deleted.`}
        confirmLabel="Delete Category"
        successMessage="Category deleted"
        onConfirm={() => (deletingCategory ? deleteCategory(deletingCategory.id) : undefined)}
      />
    </>
  );
}
