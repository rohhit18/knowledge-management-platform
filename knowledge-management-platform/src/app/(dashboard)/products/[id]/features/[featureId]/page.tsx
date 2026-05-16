import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { MediaGallery } from "@/components/cms/MediaGallery";
import { UseCaseGrid } from "@/components/cms/UseCaseGrid";
import { ArchitectureList } from "@/components/cms/ArchitectureList";
import { DownloadList } from "@/components/cms/DownloadList";
import { FAQAccordion } from "@/components/cms/FAQAccordion";

interface PageProps {
  params: { id: string; featureId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const feature = await prisma.productFeature.findUnique({
    where: { id: params.featureId },
    select: { name: true },
  });
  return { title: feature?.name ?? "Feature" };
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

export default async function FeatureDetailPage({ params }: PageProps) {
  const feature = await prisma.productFeature.findUnique({
    where: { id: params.featureId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          platform: { select: { name: true } },
        },
      },
      mediaItems: { orderBy: [{ order: "asc" }] },
      useCases: { orderBy: [{ order: "asc" }] },
      architectureSections: { orderBy: [{ order: "asc" }] },
      downloads: { orderBy: [{ order: "asc" }] },
      faqs: { orderBy: [{ order: "asc" }] },
    },
  });

  if (!feature) notFound();
  if (feature.productId !== params.id) notFound();

  const { product } = feature;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <span>{product.platform.name}</span>
        <ChevronRight className="w-4 h-4 flex-shrink-0" />
        <Link
          href={`/products/${product.id}`}
          className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          {product.name}
        </Link>
        <ChevronRight className="w-4 h-4 flex-shrink-0" />
        <span className="text-slate-900 dark:text-slate-100 font-medium truncate">
          {feature.name}
        </span>
      </nav>

      {/* Feature header card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        {feature.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={feature.coverImage}
            alt={feature.name}
            className="aspect-video w-full object-cover rounded-xl mb-6"
          />
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {feature.name}
            </h1>
            <Badge variant={statusVariant(feature.status)}>
              {feature.status}
            </Badge>
          </div>

          {feature.overview && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {feature.overview}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      {feature.details && (
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Details
          </h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {feature.details}
            </div>
          </div>
        </section>
      )}

      {/* Media Gallery */}
      {feature.mediaItems.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Gallery
          </h2>
          <MediaGallery items={feature.mediaItems} />
        </section>
      )}

      {/* Use Cases */}
      {feature.useCases.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Use Cases
          </h2>
          <UseCaseGrid useCases={feature.useCases} />
        </section>
      )}

      {/* Architecture */}
      {feature.architectureSections.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            System Architecture
          </h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-6">
            <ArchitectureList sections={feature.architectureSections} />
          </div>
        </section>
      )}

      {/* Downloads */}
      {feature.downloads.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Downloads &amp; Resources
          </h2>
          <DownloadList downloads={feature.downloads} />
        </section>
      )}

      {/* FAQs */}
      {feature.faqs.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <FAQAccordion faqs={feature.faqs} />
        </section>
      )}
    </div>
  );
}
