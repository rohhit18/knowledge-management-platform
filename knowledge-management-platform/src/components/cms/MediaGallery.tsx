import { Play } from "lucide-react";

interface MediaItem {
  id: string;
  title: string | null;
  url: string;
  type: "IMAGE" | "VIDEO";
  description: string | null;
  order: number;
}

interface Props {
  items: MediaItem[];
}

export function MediaGallery({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) =>
        item.type === "IMAGE" ? (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.title ?? "Gallery image"}
              className="w-full aspect-video object-cover"
            />
            {item.title && (
              <p className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                {item.title}
              </p>
            )}
          </div>
        ) : (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-700 flex items-center justify-center group hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/80 dark:bg-slate-800/80 text-primary-600 group-hover:scale-105 transition-transform shadow-md">
                  <Play className="w-6 h-6 ml-0.5" />
                </div>
              </div>
            </a>
            <div className="px-3 py-2">
              {item.title && (
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mb-0.5">
                  {item.title}
                </p>
              )}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline truncate block"
              >
                Watch video
              </a>
            </div>
          </div>
        )
      )}
    </div>
  );
}
