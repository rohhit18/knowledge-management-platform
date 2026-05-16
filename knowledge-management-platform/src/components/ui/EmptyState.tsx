import { cn } from "@/lib/utils";
import { ReactElement } from "react";

interface EmptyStateProps {
  icon?: ReactElement;
  title: string;
  description?: string;
  action?: ReactElement;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
          <span className="w-8 h-8 [&>svg]:w-8 [&>svg]:h-8">{icon}</span>
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
