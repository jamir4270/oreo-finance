"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  Target,
  Settings,
  PlusCircle,
  PieChart,
  LineChart,
} from "lucide-react";

interface DesktopSidebarProps {
  onOpenAddTransaction: () => void;
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Budgets", href: "/budgets", icon: PieChart },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DesktopSidebar({ onOpenAddTransaction }: DesktopSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
      {/* Brand header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <Image
          src="/oreo.svg"
          alt="Oreo Mascot"
          width={28}
          height={28}
          className="h-7 w-7"
          style={{ imageRendering: "pixelated" }}
        />
        <span className="font-heading text-lg font-semibold tracking-tight text-oreo-slate-purple">
          Oreo
        </span>
      </div>

      {/* Primary Action */}
      <div className="px-4 py-6">
        <Button
          onClick={onOpenAddTransaction}
          className="w-full justify-center gap-2 shadow-sm py-5 text-base"
        >
          <PlusCircle className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-oreo-periwinkle/15 text-oreo-slate-purple"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon
                className={`h-4 w-4 ${
                  isActive ? "text-oreo-slate-purple" : "text-muted-foreground"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
