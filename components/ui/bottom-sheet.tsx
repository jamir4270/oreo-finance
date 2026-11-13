"use client";

import * as React from "react";
import { Drawer } from "@base-ui/react/drawer";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * iOS-style sheet (UISheetPresentationController feel):
 * - swipe down to dismiss, velocity-aware; backdrop fades with the drag
 * - grabber, centred 17pt semibold title, round grey close button
 * - UIKit's sheet curve (--ease-ios), keyboard-aware for forms
 * - "bleed": the popup extends 3rem below the screen so a fast upward flick
 *   never reveals a gap under the sheet
 */

interface BottomSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Visually hide the title (still announced to screen readers) */
  hideTitle?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  hideTitle,
  children,
  className,
}: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={(next) => onOpenChange?.(next)}>
      {trigger && <Drawer.Trigger render={trigger} />}
      <Drawer.VirtualKeyboardProvider>
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black opacity-[calc(0.3*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-(--ease-ios) data-swiping:duration-0 data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute" />
          <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
            <Drawer.Popup
              className={cn(
                "-mb-12 flex max-h-[calc(92dvh+3rem)] w-full max-w-lg flex-col rounded-t-[1.75rem] bg-card pb-12 text-card-foreground shadow-[0_-8px_40px_rgba(61,61,92,0.18)] outline-none",
                "[transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[450ms] ease-(--ease-ios) will-change-transform",
                "data-swiping:select-none data-starting-style:[transform:translateY(calc(100%-3rem+2px))] data-ending-style:[transform:translateY(calc(100%-3rem+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]",
                "motion-reduce:transition-none",
                className
              )}
            >
              {/* Header is the drag handle: grabber + title + close */}
              <div className="relative shrink-0 touch-none select-none px-5 pt-2 pb-3">
                <div aria-hidden className="mx-auto h-[5px] w-9 rounded-full bg-foreground/20" />
                <div className="mt-3 flex min-h-8 items-center justify-center px-10">
                  <Drawer.Title
                    className={cn(
                      "text-center text-[17px] font-semibold leading-tight text-foreground",
                      hideTitle && "sr-only"
                    )}
                  >
                    {title}
                  </Drawer.Title>
                </div>
                {description && (
                  <Drawer.Description className="mt-1 text-center text-[13px] text-muted-foreground">
                    {description}
                  </Drawer.Description>
                )}
                <Drawer.Close
                  aria-label="Close"
                  className="absolute top-4 right-4 flex size-[30px] items-center justify-center rounded-full bg-foreground/[0.08] text-foreground/60 transition-opacity active:opacity-50"
                >
                  <XIcon className="size-4" strokeWidth={2.5} />
                </Drawer.Close>
              </div>
              <Drawer.Content className="min-h-0 flex-1 touch-auto overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                {children}
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.VirtualKeyboardProvider>
    </Drawer.Root>
  );
}
