import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "purple"
  | "orange"
  | "indigo";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  blue:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  green:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  yellow:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  red:
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  indigo:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
