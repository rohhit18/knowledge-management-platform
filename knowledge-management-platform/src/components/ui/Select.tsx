"use client";
import { cn } from "@/lib/utils";
import { forwardRef, SelectHTMLAttributes, useId } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, placeholder, className, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm transition-colors appearance-none",
            "bg-white dark:bg-slate-900",
            "text-slate-900 dark:text-slate-100",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            error
              ? "border-red-400 dark:border-red-500 focus:ring-red-400 dark:focus:ring-red-500"
              : "border-slate-300 dark:border-slate-600 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            // Custom chevron via background SVG
            "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")] bg-no-repeat bg-[right_0.75rem_center] pr-10",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
