"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  PieChart,
  Ellipsis,
  Wallet,
  Tags,
  LineChart,
  Settings,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ActionSheet } from "@/components/ui/action-sheet";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onOpenAddTransaction: () => void;
}

const TABS = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Activity", href: "/transactions", icon: ArrowLeftRight },
  { name: "Budgets", href: "/budgets", icon: PieChart },
];

const MORE_MENU_ITEMS = [
  { name: "Accounts", href: "/accounts", icon: Wallet, tint: "bg-oreo-slate-purple" },
  { name: "Categories", href: "/categories", icon: Tags, tint: "bg-oreo-dusty-rose" },
  { name: "Analytics", href: "/analytics", icon: LineChart, tint: "bg-oreo-dusty-teal" },
  { name: "Settings", href: "/settings", icon: Settings, tint: "bg-oreo-periwinkle" },
];

const tabClass = (active: boolean) =>
  cn(
    "flex flex-1 flex-col items-center justify-center gap-0.5 pt-1 transition-opacity active:opacity-50",
    active ? "text-oreo-slate-purple" : "text-muted-foreground"
  );

function TabIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  // Lucide has no filled variants; a heavier stroke reads like SF Symbols' selected state.
  return <Icon className="size-[25px]" strokeWidth={active ? 2.4 : 1.8} aria-hidden />;
}

/**
 * iOS tab bar: 49pt, translucent material over content, hairline top border,
 * no layout shift between states, home-indicator safe area.
 */
export function MobileBottomNav({ onOpenAddTransaction }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);
  const [confirmSignOut, setConfirmSignOut] = React.useState(false);
  const [, startTransition] = React.useTransition();
  const moreActive = MORE_MENU_ITEMS.some((item) => pathname.startsWith(item.href));

  const tab = (t: (typeof TABS)[number]) => {
    const active = pathname.startsWith(t.href);
    return (
      <Link key={t.href} href={t.href} className={tabClass(active)} aria-current={active ? "page" : undefined}>
        <TabIcon icon={t.icon} active={active} />
        <span className="text-[10px] font-medium leading-none">{t.name}</span>
      </Link>
    );
  };

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.08] bg-card/80 pb-safe backdrop-blur-xl backdrop-saturate-150 lg:hidden"
      >
        <div className="flex h-[49px] items-stretch">
          {tab(TABS[0])}
          {tab(TABS[1])}

          <div className="flex flex-1 items-center justify-center">
            <button
              type="button"
              onClick={onOpenAddTransaction}
              aria-label="Add transaction"
              className="flex h-9 w-12 items-center justify-center rounded-full bg-oreo-slate-purple text-white shadow-[0_2px_8px_rgba(86,86,118,0.35)] transition-transform duration-150 ease-(--ease-ios) active:scale-90"
            >
              <Plus className="size-[22px]" strokeWidth={2.6} />
            </button>
          </div>

          {tab(TABS[2])}

          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={tabClass(moreActive)}
            aria-haspopup="dialog"
          >
            <TabIcon icon={Ellipsis} active={moreActive} />
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>

      <BottomSheet open={isMoreOpen} onOpenChange={setIsMoreOpen} title="More">
        {/* Inset grouped list (iOS Settings style) */}
        <nav className="overflow-hidden rounded-xl bg-background/60">
          {MORE_MENU_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMoreOpen(false)}
                aria-current={active ? "page" : undefined}
                className="flex min-h-11 items-center gap-3 pl-4 transition-colors active:bg-foreground/[0.06]"
              >
                <span className={cn("flex size-[29px] shrink-0 items-center justify-center rounded-[7px] text-white", item.tint)}>
                  <item.icon className="size-[18px]" strokeWidth={2} aria-hidden />
                </span>
                {/* Separator is inset to the text edge, like UITableView */}
                <span className="flex min-h-11 flex-1 items-center justify-between border-b border-foreground/10 pr-4 [a:last-child_&]:border-b-0">
                  <span className={cn("text-[17px]", active ? "font-semibold text-oreo-slate-purple" : "text-foreground")}>
                    {item.name}
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground/60" strokeWidth={2.5} aria-hidden />
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 overflow-hidden rounded-xl bg-background/60">
          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className="flex min-h-11 w-full items-center gap-3 pl-4 text-destructive transition-colors active:bg-foreground/[0.06]"
          >
            <span className="flex size-[29px] shrink-0 items-center justify-center rounded-[7px] bg-destructive text-white">
              <LogOut className="size-[18px]" strokeWidth={2} aria-hidden />
            </span>
            <span className="text-[17px]">Sign Out</span>
          </button>
        </div>
      </BottomSheet>

      <ActionSheet
        open={confirmSignOut}
        onOpenChange={setConfirmSignOut}
        message="You'll need to sign in again to see your finances."
        actions={[
          {
            label: "Sign Out",
            destructive: true,
            onSelect: () => {
              setIsMoreOpen(false);
              startTransition(() => logout());
            },
          },
        ]}
      />
    </>
  );
}
