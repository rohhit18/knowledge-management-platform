import { Metadata } from "next";
import Link from "next/link";
import {
  LayoutGrid,
  Package,
  FolderKanban,
  Boxes,
  FileText,
  Users,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Plus,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/ui/StatsCard";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DOC_TYPE_LABELS, PROJECT_STATUS_LABELS, ProjectStatus } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

function projectStatusVariant(
  status: ProjectStatus
): "green" | "yellow" | "orange" | "default" {
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

export default async function DashboardPage() {
  const [
    platformCount,
    productCount,
    projectCount,
    moduleCount,
    documentCount,
    userCount,
    courseCount,
    enrollmentCount,
    recentDocuments,
    recentProjects,
  ] = await Promise.all([
    prisma.platform.count(),
    prisma.product.count(),
    prisma.project.count(),
    prisma.module.count(),
    prisma.document.count({ where: { published: true } }),
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.document.findMany({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        author: { select: { name: true } },
        product: { select: { name: true } },
        project: { select: { name: true } },
        module: { select: { name: true } },
      },
    }),
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        product: { include: { platform: { select: { name: true } } } },
        _count: { select: { modules: true, members: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overview of your knowledge management platform
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Platforms"
          value={platformCount}
          icon={<LayoutGrid />}
          color="blue"
        />
        <StatsCard
          title="Products"
          value={productCount}
          icon={<Package />}
          color="purple"
        />
        <StatsCard
          title="Projects"
          value={projectCount}
          icon={<FolderKanban />}
          color="green"
        />
        <StatsCard
          title="Modules"
          value={moduleCount}
          icon={<Boxes />}
          color="orange"
        />
        <StatsCard
          title="Published Docs"
          value={documentCount}
          icon={<FileText />}
          color="blue"
        />
        <StatsCard
          title="Team Members"
          value={userCount}
          icon={<Users />}
          color="green"
        />
        <StatsCard
          title="Courses"
          value={courseCount}
          icon={<BookOpen />}
          color="purple"
        />
        <StatsCard
          title="Enrollments"
          value={enrollmentCount}
          icon={<GraduationCap />}
          color="orange"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/products", label: "View Products", icon: Package },
            { href: "/projects", label: "View Projects", icon: FolderKanban },
            { href: "/modules", label: "View Modules", icon: Boxes },
            { href: "/documents", label: "Browse Documents", icon: FileText },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <Link
            href="/documents/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Document
          </Link>
        </div>
      </div>

      {/* Two-column recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Documents
              </h2>
              <Link
                href="/documents"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {recentDocuments.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 px-6 py-8 text-center">
                No published documents yet.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentDocuments.map((doc) => {
                  const scope =
                    doc.module?.name ??
                    doc.project?.name ??
                    doc.product?.name ??
                    "—";
                  return (
                    <li key={doc.id}>
                      <Link
                        href={`/documents/${doc.id}`}
                        className="flex items-start gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                      >
                        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {doc.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {scope} · {doc.author.name} ·{" "}
                            {formatRelativeTime(doc.updatedAt)}
                          </p>
                        </div>
                        <Badge variant="default">
                          {DOC_TYPE_LABELS[doc.type]}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Active Projects
              </h2>
              <Link
                href="/projects"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 px-6 py-8 text-center">
                No active projects.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentProjects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex items-start gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <FolderKanban className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {project.product.platform.name} ›{" "}
                          {project.product.name} · {project._count.modules}{" "}
                          modules · {project._count.members} members
                        </p>
                      </div>
                      <Badge variant={projectStatusVariant(project.status)}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
