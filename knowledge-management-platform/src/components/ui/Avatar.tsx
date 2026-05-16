import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  src?: string;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

// Deterministic color palette chosen by name hash
const colorPalette: string[] = [
  "bg-red-500 text-white",
  "bg-orange-500 text-white",
  "bg-amber-500 text-white",
  "bg-yellow-500 text-white",
  "bg-lime-600 text-white",
  "bg-green-600 text-white",
  "bg-emerald-600 text-white",
  "bg-teal-600 text-white",
  "bg-cyan-600 text-white",
  "bg-sky-600 text-white",
  "bg-blue-600 text-white",
  "bg-indigo-600 text-white",
  "bg-violet-600 text-white",
  "bg-purple-600 text-white",
  "bg-fuchsia-600 text-white",
  "bg-pink-600 text-white",
  "bg-rose-600 text-white",
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColor(name: string): string {
  return colorPalette[hashName(name) % colorPalette.length];
}

export function Avatar({ name, size = "md", src, className }: AvatarProps) {
  const initials = getInitials(name);
  const colorClass = getColor(name);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover flex-shrink-0",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <span
      title={name}
      aria-label={name}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold flex-shrink-0 select-none",
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {initials}
    </span>
  );
}
