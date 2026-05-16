import { cn } from "@/lib/utils";
import { ReactElement } from "react";

type StatsColor = "blue" | "green" | "purple" | "orange";

interface Trend {
  value: number;
  label: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactElement;
  trend?: Trend;
  color?: StatsColor;
  className?: string;
}

const colorClasses: Record<
  StatsColor,
  { icon: string; trendUp: string; trendDown: string }
> = {
  blue: {
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    trendUp: "text-green-600 dark:text-green-400",
    trendDown: "text-red-600 dark:text-red-400",
  },
  green: {
    icon: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
    trendUp: "text-green-600 dark:text-green-400",
    trendDown: "text-red-600 dark:text-red-400",
  },
  purple: {
    icon: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    trendUp: "text-green-600 dark:text-green-400",
    trendDown: "text-red-600 dark:text-red-400",
  },
  orange: {
    icon: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",
    trendUp: "text-green-600 dark:text-green-400",
    trendDown: "text-red-600 dark:text-red-400",
  },
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  color = "blue",
  className,
}: StatsCardProps) {
  const colors = colorClasses[color];
  const isPositive = trend ? trend.value >= 0 : true;

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 flex items-start gap-4",
        className
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl [&>svg]:w-6 [&>svg]:h-6",
          colors.icon
        )}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
          {title}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {value}
        </p>

        {trend && (
          <div
            className={cn(
              "mt-1 flex items-center gap-1 text-xs font-medium",
              isPositive ? colors.trendUp : colors.trendDown
            )}
          >
            {isPositive ? (
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 17a.75.75 0 01-.75-.75V5.56L6.03 8.78a.75.75 0 01-1.06-1.06l4.5-4.5a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06L10.75 5.56v10.69A.75.75 0 0110 17z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 01.75.75v10.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3.75A.75.75 0 0110 3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span>
              {isPositive ? "+" : ""}
              {trend.value}% {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
