"use client";

import { useState } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { AddTransactionModal } from "./AddTransactionModal";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleOpenAddModal = () => setIsAddModalOpen(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar (lg and up) */}
      <DesktopSidebar onOpenAddTransaction={handleOpenAddModal} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav (below lg) */}
      <MobileBottomNav onOpenAddTransaction={handleOpenAddModal} />

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}
