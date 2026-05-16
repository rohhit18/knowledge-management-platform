import Link from "next/link";
import { Lightbulb, Download, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { truncate } from "@/lib/utils";

interface Feature {
  id: string;
  name: string;
  slug: string;
  overview: string | null;
  coverImage: string | null;
  status: string;
  _count?: {
    useCases: number;
    downloads: number;
    faqs: number;
  };
}

interface Props {
  feature: Feature;
  productId: string;
}

function statusVariant(status: string): "green" | "yellow" | "default" {
  switch (status.toLowerCase()) {
    case "active":
      return "green";
    case "draft":
    case "coming_soon":
      return "yellow";
    default:
      return "default";
  }
}

export function FeatureCard({ feature, productId }: Props) {
  return (
    <Link href={`/products/${productId}/features/${feature.id}`}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow group h-full flex flex-col">
        {/* Cover image */}
        {feature.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={feature.coverImage}
            alt={feature.name}
            className="w-full aspect-video object-cover flex-shrink-0"
          />
        )}

        <div className="p-5 flex flex-col flex-1">
          {/* Name + status */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
              {feature.name}
            </h3>
            <Badge variant={statusVariant(feature.status)} className="flex-shrink-0">
              {feature.status}
            </Badge>
          </div>

          {/* Overview */}
          {feature.overview && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex-1 line-clamp-2">
              {truncate(feature.overview, 120)}
            </p>
          )}

          {/* Stats row */}
          {feature._count && (
            <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                {feature._count.useCases} use case{feature._count.useCases !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />
                {feature._count.downloads} download{feature._count.downloads !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                {feature._count.faqs} FAQ{feature._count.faqs !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
