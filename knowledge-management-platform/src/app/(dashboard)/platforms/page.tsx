import { Metadata } from "next";
import Link from "next/link";
import { Layers, FolderKanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "Platforms" };

export default async function PlatformsPage() {
  const platforms = await prisma.platform.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
      products: {
        include: { _count: { select: { projects: true } } },
        take: 3,
        orderBy: { name: "asc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Platforms
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your technology platforms
        </p>
      </div>

      {/* Grid */}
      {platforms.length === 0 ? (
        <EmptyState
          icon={<Layers />}
          title="No platforms yet"
          description="Platforms group your products together."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {platforms.map((platform) => (
            <Card key={platform.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col flex-1">
                {/* Platform name + product count */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link
                    href={`/platforms/${platform.id}`}
                    className="text-lg font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors leading-tight"
                  >
                    {platform.name}
                  </Link>
                  <Badge variant="indigo">
                    {platform._count.products}{" "}
                    {platform._count.products === 1 ? "Product" : "Products"}
                  </Badge>
                </div>

                {/* Description */}
                {platform.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {truncate(platform.description, 120)}
                  </p>
                )}

                {/* Mini product list */}
                {platform.products.length > 0 && (
                  <ul className="mt-auto space-y-1.5">
                    {platform.products.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="text-slate-700 dark:text-slate-200 truncate">
                          {product.name}
                        </span>
                        <span className="shrink-0 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                          <FolderKanban className="w-3 h-3" />
                          {product._count.projects}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>

              <CardFooter>
                <Link
                  href={`/platforms/${platform.id}`}
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  View all products →
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
