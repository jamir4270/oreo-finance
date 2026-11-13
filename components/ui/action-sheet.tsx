"use client";

import * as React from "react";
import { Drawer } from "@base-ui/react/drawer";
import { cn } from "@/lib/utils";

export interface ActionSheetAction {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  actions: ActionSheetAction[];
  cancelLabel?: string;
}

/**
 * iOS action sheet (UIAlertController .actionSheet): a floating group of choices
 * with an optional title/message, and a separate bold Cancel button below.
 * Used for confirmations instead of centred alert dialogs on phones.
 */
export function ActionSheet({
  open,
  onOpenChange,
  title,
  message,
  actions,
  cancelLabel = "Cancel",
}: ActionSheetProps) {
  const row =
    "flex h-14 w-full items-center justify-center text-[17px] transition-colors active:bg-foreground/[0.08] focus-visible:bg-foreground/[0.06] focus-visible:outline-none";

  return (
    <Drawer.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-[60] min-h-dvh bg-black opacity-[calc(0.35*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-(--ease-ios) data-swiping:duration-0 data-starting-style:opacity-0 data-ending-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
        <Drawer.Viewport className="fixed inset-0 z-[60] flex items-end justify-center">
          <Drawer.Popup className="pointer-events-none flex w-full max-w-md flex-col gap-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] outline-none [transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[450ms] ease-(--ease-ios) data-starting-style:[transform:translateY(calc(100%+1rem))] data-ending-style:[transform:translateY(calc(100%+1rem))] motion-reduce:transition-none">
            <Drawer.Content className="pointer-events-auto overflow-hidden rounded-[14px] bg-card/90 backdrop-blur-xl backdrop-saturate-150">
              {title || message ? (
                <div className="px-4 py-3.5 text-center">
                  {title && (
                    <Drawer.Title className="text-[13px] font-semibold text-muted-foreground">{title}</Drawer.Title>
                  )}
                  {message && (
                    <Drawer.Description className="mt-0.5 text-[13px] text-muted-foreground">{message}</Drawer.Description>
                  )}
                </div>
              ) : (
                <Drawer.Title className="sr-only">Actions</Drawer.Title>
              )}
              <div className="divide-y divide-foreground/10 border-t border-foreground/10">
                {actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={cn(row, action.destructive ? "text-destructive" : "text-oreo-slate-purple")}
                    onClick={() => {
                      onOpenChange(false);
                      action.onSelect();
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </Drawer.Content>
            <Drawer.Close
              className={cn(
                row,
                "pointer-events-auto rounded-[14px] bg-card font-semibold text-oreo-slate-purple"
              )}
            >
              {cancelLabel}
            </Drawer.Close>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
