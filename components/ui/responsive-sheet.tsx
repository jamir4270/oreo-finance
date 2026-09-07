"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface ResponsiveSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveSheet({ open, onOpenChange, trigger, title, description, children, className }: ResponsiveSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const side = isDesktop ? "right" : "bottom";
  
  // On mobile (bottom side), we want it to act like a bottom sheet
  const contentClassName = isDesktop 
    ? `sm:max-w-[425px] sm:w-[425px] flex flex-col p-0 ${className || ''}`
    : `max-h-[90vh] flex flex-col p-0 rounded-t-3xl ${className || ''}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger render={trigger} />}
      <SheetContent side={side} className={contentClassName}>
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
