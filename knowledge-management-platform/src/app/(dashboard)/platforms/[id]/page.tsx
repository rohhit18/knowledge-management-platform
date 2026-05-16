import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Package,
  FolderKanban,
  FileText,
  User,
  Tag,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { truncate } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const platform = await prisma.platform.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return { title: platform?.name ?? "Platform" };
}

export default async function PlatformDetailPage({ params }: PageProps) {
  const platform = await prisma.platform.findUnique({
    where: { id: params.id },
    include: {
      products: {
        include: {
          owner: { select: { name: true, email: true } },
          _count: { select: { projects: true, documents: true } },
          tags: { select: { name: true } },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!platform) notFound();

  const productCount = platform.products.length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Platforms", href: "/platforms" },
          { label: platform.name },
        ]}
      />

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {platform.name}
          </h1>
          {platform.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              {platform.description}
            </p>
          )}
        </div>
        <Badge variant="indigo">
          {productCount} {productCount === 1 ? "Product" : "Products"}
        </Badge>
      </div>

      {/* Products grid */}
      {productCount === 0 ? (
        <EmptyState
          icon={<Package />}
          title="No products"
          description="No products linked to this platform."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {platform.products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="flex flex-col h-full">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex-shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <Badge variant={product.status === "active" ? "green" : "default"}>
                      {product.status}
                    </Badge>
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
                    {product.name}
                  </h3>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      {truncate(product.description, 100)}
                    </p>
                  )}

                  {/* Tech stack */}
                  {product.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {product.techStack.slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {product.techStack.length > 5 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                          +{product.techStack.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Owner */}
                  {product.owner && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
                      <User className="w-3.5 h-3.5" />
                      <span>{product.owner.name ?? product.owner.email}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {product.tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1 mb-2">
                      <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                      {product.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag.name} variant="default">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Counts */}
                  <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <FolderKanban className="w-3.5 h-3.5" />
                      {product._count.projects} projects
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {product._count.documents} docs
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
