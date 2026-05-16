import { cn } from "@/lib/utils";
import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table
        className={cn(
          "w-full text-sm text-left text-slate-700 dark:text-slate-300",
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "bg-slate-50 dark:bg-slate-800/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        "divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800",
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeader({
  className,
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-3 font-semibold whitespace-nowrap",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  className,
  children,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-3 whitespace-nowrap", className)}
      {...props}
    >
      {children}
    </td>
  );
}
