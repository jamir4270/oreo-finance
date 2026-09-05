"use client";

import * as React from "react";
import { MoreVertical, Trash2, Pencil, ShieldAlert } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryData } from "./EditCategoryDialog";

interface CategoryCardProps {
  category: CategoryData;
  onEdit: (category: CategoryData) => void;
  onDelete: (category: CategoryData) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const Icon = category.icon ? (LucideIcons as any)[category.icon] : LucideIcons.Tag;

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md overflow-hidden">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-oreo-lavender/50 text-oreo-slate-purple">
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-base font-medium text-foreground truncate">
              {category.name}
            </h3>
            {category.is_default && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider shrink-0">
                Default
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground capitalize truncate">
            {category.txn_type}
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
          <DropdownMenuItem onClick={() => onEdit(category)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Category
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDelete(category)}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
