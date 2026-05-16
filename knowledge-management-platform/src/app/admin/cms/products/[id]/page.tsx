import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCmsClient } from "./ProductCmsClient";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return { title: product ? `${product.name} CMS — Admin` : "CMS — Admin" };
}

export default async function ProductCmsPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      platform: true,
      productFeatures: { orderBy: [{ order: "asc" }, { name: "asc" }] },
      mediaItems: { orderBy: [{ order: "asc" }] },
      useCases: { orderBy: [{ order: "asc" }] },
      architectureSections: { orderBy: [{ order: "asc" }] },
      downloads: { orderBy: [{ order: "asc" }] },
      faqs: { orderBy: [{ order: "asc" }] },
    },
  });

  if (!product) notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/admin/cms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          CMS
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">{product.name}</span>
      </nav>

      <ProductCmsClient product={product} />
    </div>
  );
}
