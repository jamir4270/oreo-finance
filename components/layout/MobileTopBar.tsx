"use client";

import { Mascot } from "@/components/ui/mascot";
import Link from "next/link";

export function MobileTopBar({ dailyTxnCount = 0 }: { dailyTxnCount?: number }) {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-black/[0.06] bg-background/80 px-5 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-xl backdrop-saturate-150 lg:hidden">
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
