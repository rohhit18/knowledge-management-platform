"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/providers";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors",
        "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
        "dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        className
      )}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
