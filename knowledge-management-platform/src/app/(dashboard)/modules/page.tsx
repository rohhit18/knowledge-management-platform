import { Metadata } from "next";
import Link from "next/link";
import { Boxes, FileText, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MODULE_STATUS_LABELS, ModuleStatus } from "@/types";
import { truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "Modules" };

interface PageProps {
  searchParams: { project?: string; status?: string; q?: string };
}

const STATUS_OPTIONS: ModuleStatus[] = ["ACTIVE", "IN_DEVELOPMENT", "DEPRECATED"];

function moduleStatusVariant(
  status: ModuleStatus
): "green" | "blue" | "default" {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "IN_DEVELOPMENT":
      return "blue";
    default:
      return "default";
  }
}

export default async function ModulesPage({ searchParams }: PageProps) {
  const { project: projectFilter, status, q: search } = searchParams;
  const validStatus = STATUS_OPTIONS.includes(status as ModuleStatus)
    ? (status as ModuleStatus)
    : undefined;

  const projects = await prisma.project.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const modules = await prisma.module.findMany({
    where: {
      ...(projectFilter ? { projectId: projectFilter } : {}),
      ...(validStatus ? { status: validStatus } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      parentId: null, // top-level only in listing
    },
    include: {
      project: {
        include: {
          product: { include: { platform: { select: { name: true } } } },
        },
      },
      _count: { select: { features: true, documents: true, subModules: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Modules
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Browse all top-level modules across projects
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="project"
          defaultValue={projectFilter ?? ""}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={validStatus ?? ""}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {MODULE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="q"
          placeholder="Search modules…"
          defaultValue={search ?? ""}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
        {(projectFilter || validStatus || search) && (
          <Link
            href="/modules"
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {modules.length} module{modules.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      {modules.length === 0 ? (
        <EmptyState
          icon={<Boxes />}
          title="No modules found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <Link key={mod.id} href={`/modules/${mod.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex-shrink-0">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <Badge variant={moduleStatusVariant(mod.status)}>
                      {MODULE_STATUS_LABELS[mod.status]}
                    </Badge>
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
                    {mod.name}
                  </h3>

                  {/* Breadcrumb */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {mod.project.product.platform.name} ›{" "}
                    {mod.project.product.name} › {mod.project.name}
                  </p>

                  {/* Description */}
                  {mod.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex-1">
                      {truncate(mod.description, 90)}
                    </p>
                  )}

                  {/* Counts */}
                  <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      {mod._count.features} features
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {mod._count.documents} docs
                    </span>
                    {mod._count.subModules > 0 && (
                      <span className="flex items-center gap-1">
                        <Boxes className="w-3.5 h-3.5" />
                        {mod._count.subModules} sub
                      </span>
                    )}
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
