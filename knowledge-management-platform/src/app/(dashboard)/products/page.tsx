import { Metadata } from "next";
import Link from "next/link";
import { Package, Layers, FolderKanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

interface PageProps {
  searchParams: { platform?: string; q?: string };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { platform: platformFilter, q: search } = searchParams;

  const platforms = await prisma.platform.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const products = await prisma.product.findMany({
    where: {
      ...(platformFilter ? { platformId: platformFilter } : {}),
      ...(search
        ? { name: { contains: search, mode: "insensitive" } }
        : {}),
    },
    include: {
      platform: { select: { id: true, name: true } },
      _count: { select: { projects: true, documents: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Products
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Browse all products across platforms
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="platform"
          defaultValue={platformFilter ?? ""}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Platforms</option>
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="q"
          placeholder="Search products…"
          defaultValue={search ?? ""}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
        {(platformFilter || search) && (
          <Link
            href="/products"
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Products count */}
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {products.length} product{products.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      {products.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title="No products found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex-shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <Badge variant="indigo">{product.platform.name}</Badge>
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
                    {product.name}
                  </h3>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex-1">
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

                  {/* Counts */}
                  <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <FolderKanban className="w-3.5 h-3.5" />
                      {product._count.projects} projects
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
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
