import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FeatureCmsClient } from "./FeatureCmsClient";

export async function generateMetadata({ params }: { params: { id: string; featureId: string } }) {
  const feature = await prisma.productFeature.findUnique({
    where: { id: params.featureId },
    select: { name: true },
  });
  return { title: feature ? `${feature.name} — Feature CMS — Admin` : "Feature CMS — Admin" };
}

export default async function FeatureCmsPage({ params }: { params: { id: string; featureId: string } }) {
  const feature = await prisma.productFeature.findUnique({
    where: { id: params.featureId },
    include: {
      product: { select: { id: true, name: true } },
      mediaItems: { orderBy: [{ order: "asc" }] },
      useCases: { orderBy: [{ order: "asc" }] },
      architectureSections: { orderBy: [{ order: "asc" }] },
      downloads: { orderBy: [{ order: "asc" }] },
      faqs: { orderBy: [{ order: "asc" }] },
    },
  });

  if (!feature || feature.productId !== params.id) notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6 flex-wrap">
        <Link href="/admin/cms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          CMS
        </Link>
        <span>/</span>
        <Link
          href={`/admin/cms/products/${feature.product.id}`}
          className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {feature.product.name}
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">{feature.name}</span>
      </nav>

      <FeatureCmsClient feature={feature} />
    </div>
  );
}
