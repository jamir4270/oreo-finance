"use client";

import { Mascot } from "@/components/ui/mascot";
import Link from "next/link";
import { NAV_BAR_ATTR, useNavTitle } from "./nav-title";
import { cn } from "@/lib/utils";

export function MobileTopBar({ dailyTxnCount = 0 }: { dailyTxnCount?: number }) {
  const { title, collapsed } = useNavTitle();
  return (
    <div
      {...{ [NAV_BAR_ATTR]: "" }}
      className={cn(
        // Hairline appears only once content scrolls under the bar, as in UINavigationBar
        "sticky top-0 z-40 flex items-center justify-between border-b bg-background/80 px-5 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-xl backdrop-saturate-150 transition-colors duration-200 lg:hidden",
        collapsed ? "border-black/[0.08]" : "border-transparent"
      )}
    >
      {/* Inline title; the page's <h1> stays the real heading for assistive tech */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-24 bottom-2.5 flex h-10 items-center justify-center truncate text-[17px] font-semibold text-foreground transition-opacity duration-200",
          collapsed && title ? "opacity-100" : "opacity-0"
        )}
      >
        {title}
      </span>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oreo-lavender/50 text-oreo-slate-purple">
          <Mascot pose="idle" className="h-6 w-6" />
        </div>
      </div>
      
      <Link 
        href="https://forms.gle/33Et1FaoLFyPtzM66"
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-9 items-center justify-center rounded-full bg-oreo-slate-purple/10 px-4 text-[13px] font-semibold text-oreo-slate-purple transition-opacity active:opacity-60"
      >
        Give Feedback
      </Link>
    </div>
  );
}
