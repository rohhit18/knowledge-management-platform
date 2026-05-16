"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area — offset by sidebar width on desktop */}
      <div
        className={cn(
          "flex flex-col flex-1 overflow-hidden",
          "ml-0 lg:ml-64"
        )}
      >
        {/* Top navigation bar */}
        <TopNav
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
