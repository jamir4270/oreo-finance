"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BottomSheet } from "@/components/ui/bottom-sheet";

interface ResponsiveSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Swipeable iOS bottom sheet on phones, side panel on tablet/desktop. */
export function ResponsiveSheet({ open, onOpenChange, trigger, title, description, children, className }: ResponsiveSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!isDesktop) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        trigger={trigger}
        title={title}
        description={description}
        className={className}
      >
        {children}
      </BottomSheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger render={trigger} />}
      <SheetContent side="right" className={`sm:max-w-[425px] sm:w-[425px] flex flex-col p-0 ${className || ''}`}>
        <SheetHeader className="px-6 pt-4 pb-2 shrink-0 border-b border-border/50">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 pt-4">
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
