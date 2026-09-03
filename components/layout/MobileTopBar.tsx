"use client";

import { Mascot } from "@/components/ui/mascot";

export function MobileTopBar() {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-background border-b border-border/50 lg:hidden">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oreo-lavender/50 text-oreo-slate-purple">
          <Mascot pose="idle" className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Welcome back
          </span>
          <span className="font-heading text-sm font-semibold text-foreground">
            Hi there 👋
          </span>
        </div>
      </div>
    </div>
  );
}
