"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        {/* Home crumb */}
        <li className="flex items-center">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            )}
            aria-label="Home"
          >
            <Home className="h-4 w-4 shrink-0" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {/* Separator */}
              <ChevronRight
                className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0"
                aria-hidden="true"
              />

              {isLast || !item.href ? (
                /* Current page — non-clickable */
                <span
                  className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                /* Ancestor — clickable link */
                <Link
                  href={item.href}
                  className={cn(
                    "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors truncate max-w-[200px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
