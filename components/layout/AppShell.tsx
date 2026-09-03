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
}

export function AppShell({ children, accounts, categories }: AppShellProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleOpenAddModal = () => setIsAddModalOpen(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar (lg and up) */}
      <DesktopSidebar onOpenAddTransaction={handleOpenAddModal} />

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-y-auto pb-16 lg:pb-0">
        <MobileTopBar />
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
