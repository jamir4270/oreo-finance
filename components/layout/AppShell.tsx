"use client";

import { useState } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileTopBar } from "./MobileTopBar";
import { TransactionDialog, TxnAccountData, TxnCategoryData } from "../transactions/TransactionDialog";

interface AppShellProps {
  children: React.ReactNode;
  accounts: TxnAccountData[];
  categories: TxnCategoryData[];
  dailyTxnCount?: number;
}

export function AppShell({ children, accounts, categories, dailyTxnCount }: AppShellProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleOpenAddModal = () => setIsAddModalOpen(true);

  return (
    // Document scroll (not an inner scroller) so iOS gets rubber-banding, the collapsing
    // URL bar and tap-status-bar-to-top.
    <div className="flex min-h-dvh bg-background">
      {/* Desktop Sidebar (lg and up) */}
      <DesktopSidebar onOpenAddTransaction={handleOpenAddModal} />

      {/* Main Content Area */}
      <main className="flex min-w-0 flex-1 flex-col pb-tabbar lg:pb-0">
        <MobileTopBar dailyTxnCount={dailyTxnCount} />
        {children}
      </main>

      {/* Mobile Bottom Nav (below lg) */}
      <MobileBottomNav onOpenAddTransaction={handleOpenAddModal} />

      {/* Global Add Transaction Modal */}
      <TransactionDialog
        accounts={accounts}
        categories={categories}
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}
