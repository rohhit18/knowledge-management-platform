"use client";

import { Menu, Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn, getInitials } from "@/lib/utils";

interface TopNavProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopNav({ onMenuClick, title }: TopNavProps) {
  const { data: session } = useSession();

  const userName = session?.user?.name ?? session?.user?.email ?? "User";

  return (
    <header
      className={cn(
        "h-16 flex items-center gap-4 px-4 sm:px-6 shrink-0",
        "bg-white dark:bg-slate-900",
        "border-b border-slate-200 dark:border-slate-800",
        "sticky top-0 z-30"
      )}
    >
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className={cn(
            "inline-flex items-center justify-center rounded-md p-2 transition-colors lg:hidden",
            "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
            "dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          )}
        >
          <Menu className="h-5 w-5" />
        </button>

        {title && (
          <h1 className="text-base font-semibold text-slate-900 dark:text-white truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <ThemeToggle />

        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className={cn(
            "relative inline-flex items-center justify-center rounded-md p-2 transition-colors",
            "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
            "dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          )}
        >
          <Bell className="h-5 w-5" />
          {/* Unread indicator dot */}
          <span
            className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"
            aria-hidden="true"
          />
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" aria-hidden="true" />

        {/* User identity */}
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
              "bg-primary-600 text-white text-xs font-semibold select-none"
            )}
            aria-hidden="true"
          >
            {getInitials(userName)}
          </div>

          {/* Name (hidden on small screens) */}
          <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[140px] truncate">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
