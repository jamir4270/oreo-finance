"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  PieChart,
  Menu,
  Wallet,
  Tags,
  Target,
  LineChart,
  Settings,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileBottomNavProps {
  onOpenAddTransaction: () => void;
}

const MORE_MENU_ITEMS = [
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileBottomNav({
  onOpenAddTransaction,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-card pb-safe lg:hidden">
      {/* Home */}
      <Link
        href="/dashboard"
        className={`flex flex-col items-center justify-center gap-1 w-16 h-full ${
          pathname.startsWith("/dashboard")
            ? "text-oreo-slate-purple"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <LayoutDashboard className="h-5 w-5" />
        <span className="text-[10px] font-medium">Home</span>
      </Link>

      {/* Transactions */}
      <Link
        href="/transactions"
        className={`flex flex-col items-center justify-center gap-1 w-16 h-full ${
          pathname.startsWith("/transactions")
            ? "text-oreo-slate-purple"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ArrowLeftRight className="h-5 w-5" />
        <span className="text-[10px] font-medium">Activity</span>
      </Link>

      {/* Add Button (Center Prominent) */}
      <div className="relative -top-5 flex flex-col items-center justify-center w-16">
        <button
          onClick={onOpenAddTransaction}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-oreo-slate-purple text-primary-foreground shadow-lg hover:bg-oreo-slate-purple/90 transition-transform active:scale-95"
          aria-label="Add Transaction"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Budgets */}
      <Link
        href="/budgets"
        className={`flex flex-col items-center justify-center gap-1 w-16 h-full ${
          pathname.startsWith("/budgets")
            ? "text-oreo-slate-purple"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <PieChart className="h-5 w-5" />
        <span className="text-[10px] font-medium">Budgets</span>
      </Link>

      {/* More Menu */}
      <Sheet>
        <SheetTrigger render={
          <button className="flex flex-col items-center justify-center gap-1 w-16 h-full text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        } />
        <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl sm:hidden">
          <SheetHeader className="text-left mb-4">
            <SheetTitle className="font-heading text-oreo-slate-purple">
              More Menu
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2">
            {MORE_MENU_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-oreo-periwinkle/15 text-oreo-slate-purple"
                      : "text-muted-foreground active:bg-accent"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      isActive ? "text-oreo-slate-purple" : "text-muted-foreground"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
