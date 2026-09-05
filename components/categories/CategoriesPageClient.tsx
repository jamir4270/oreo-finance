"use client";

import * as React from "react";
import { CategoryData, EditCategoryDialog } from "./EditCategoryDialog";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { CategoryCard } from "./CategoryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteCategory } from "@/app/actions/categories";
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
import { toast } from "sonner";
interface CategoriesPageClientProps {
  categories: CategoryData[];
}

export function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  const [editingCategory, setEditingCategory] = React.useState<CategoryData | null>(null);
  const [deletingCategory, setDeletingCategory] = React.useState<CategoryData | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const expenses = categories.filter(c => c.txn_type === "expense");
  const incomes = categories.filter(c => c.txn_type === "income");
  const transfers = categories.filter(c => c.txn_type === "transfer");

  const handleDelete = async () => {
    if (!deletingCategory) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    const result = await deleteCategory(deletingCategory.id);
    
    setIsDeleting(false);
    
    if (result?.error) {
      setDeleteError(result.error);
      toast.error(result.error);
    } else {
      setDeletingCategory(null);
      toast.success("Category deleted");
    }
  };

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
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-oreo-slate-purple">
            Categories
          </h1>
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

      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => {
        if (!open && !isDeleting) {
          setDeletingCategory(null);
          setDeleteError(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category <strong>{deletingCategory?.name}</strong>.
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
