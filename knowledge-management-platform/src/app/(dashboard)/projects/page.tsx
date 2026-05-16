import { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Boxes, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PROJECT_STATUS_LABELS, ProjectStatus } from "@/types";
import { truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

interface PageProps {
  searchParams: { status?: string; q?: string };
}

const STATUS_OPTIONS: ProjectStatus[] = [
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "ARCHIVED",
];

function projectStatusVariant(
  status: ProjectStatus
): "green" | "yellow" | "orange" | "default" | "blue" {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "PLANNING":
      return "yellow";
    case "ON_HOLD":
      return "orange";
    default:
      return "default";
  }
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { status, q: search } = searchParams;
  const validStatus = STATUS_OPTIONS.includes(status as ProjectStatus)
    ? (status as ProjectStatus)
    : undefined;

  const projects = await prisma.project.findMany({
    where: {
      ...(validStatus ? { status: validStatus } : {}),
      ...(search
        ? { name: { contains: search, mode: "insensitive" } }
        : {}),
    },
    include: {
      product: {
        include: {
          platform: { select: { name: true } },
        },
      },
      _count: { select: { modules: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Projects
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          All projects across all products
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={validStatus ?? ""}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {PROJECT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="q"
          placeholder="Search projects…"
          defaultValue={search ?? ""}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
        {(validStatus || search) && (
          <Link
            href="/projects"
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {projects.length} project{projects.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban />}
          title="No projects found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="flex flex-col h-full">
                  {/* Status badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex-shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <Badge variant={projectStatusVariant(project.status)}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
                    {project.name}
                  </h3>

                  {/* Breadcrumb */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {project.product.platform.name} › {project.product.name}
                  </p>

                  {/* Client */}
                  {project.clientName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Client: {project.clientName}
                    </p>
                  )}

                  {/* Description */}
                  {project.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex-1">
                      {truncate(project.description, 90)}
                    </p>
                  )}

                  {/* Counts */}
                  <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Boxes className="w-3.5 h-3.5" />
                      {project._count.modules} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {project._count.members} members
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
