import { Download } from "lucide-react";

interface DownloadItem {
  id: string;
  name: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  fileSize: string | null;
  order: number;
}

interface Props {
  downloads: DownloadItem[];
}

export function DownloadList({ downloads }: Props) {
  if (downloads.length === 0) return null;

  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {downloads.map((item) => (
        <li
          key={item.id}
          className="flex items-start gap-4 px-5 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
        >
          {/* Icon */}
          <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mt-0.5">
            <Download className="w-4 h-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors hover:underline truncate"
              >
                {item.name}
              </a>

              {item.fileType && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase flex-shrink-0">
                  {item.fileType}
                </span>
              )}

              {item.fileSize && (
                <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                  {item.fileSize}
                </span>
              )}
            </div>

            {item.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                {item.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
