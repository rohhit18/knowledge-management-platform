import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FolderKanban,
  ChevronRight,
  Boxes,
  FileText,
  Users,
  Globe,
  Calendar,
  Tag,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/Table";
import {
  PROJECT_STATUS_LABELS,
  MODULE_STATUS_LABELS,
  DOC_TYPE_LABELS,
  ProjectStatus,
  ModuleStatus,
  ROLE_LABELS,
  UserRole,
} from "@/types";
import { formatDate, formatRelativeTime, truncate } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return { title: project?.name ?? "Project" };
}

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

export default async function ProjectDetailPage({ params }: PageProps) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      product: {
        include: { platform: { select: { id: true, name: true } } },
      },
      modules: {
        include: {
          _count: { select: { features: true, documents: true } },
        },
        orderBy: { name: "asc" },
      },
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
      environments: { orderBy: { name: "asc" } },
      documents: {
        include: { author: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 10,
      },
      tags: true,
    },
  });

  if (!project) notFound();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center flex-wrap gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <Link
          href="/products"
          className="hover:text-slate-700 dark:hover:text-slate-200"
        >
          {project.product.platform.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href={`/products/${project.product.id}`}
          className="hover:text-slate-700 dark:hover:text-slate-200"
        >
          {project.product.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-slate-100 font-medium">
          {project.name}
        </span>
      </nav>

      {/* Project header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex-shrink-0">
            <FolderKanban className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {project.name}
                </h1>
                {project.clientName && (
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    Client: {project.clientName}
                  </p>
                )}
              </div>
              <Badge variant={projectStatusVariant(project.status)}>
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
            </div>

            {project.description && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {project.description}
              </p>
            )}

            {/* Dates */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              {project.startDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Start: {formatDate(project.startDate)}
                </span>
              )}
              {project.endDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  End: {formatDate(project.endDate)}
                </span>
              )}
            </div>

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="mt-3 flex items-center flex-wrap gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {project.tags.map((tag) => (
                  <Badge key={tag.id} variant="default">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Modules ({project.modules.length})
        </h2>
        {project.modules.length === 0 ? (
          <EmptyState
            icon={<Boxes />}
            title="No modules yet"
            description="No modules have been created for this project."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {project.modules.map((mod) => (
              <Link key={mod.id} href={`/modules/${mod.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {mod.name}
                      </h3>
                      <Badge variant={moduleStatusVariant(mod.status)}>
                        {MODULE_STATUS_LABELS[mod.status]}
                      </Badge>
                    </div>
                    {mod.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex-1">
                        {truncate(mod.description, 80)}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                      <span>{mod._count.features} features</span>
                      <span>{mod._count.documents} docs</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team members */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Team Members ({project.members.length})
          </h2>
          {project.members.length === 0 ? (
            <EmptyState
              icon={<Users />}
              title="No team members"
              description="No members have been assigned to this project."
            />
          ) : (
            <Card>
              <CardContent className="px-0 py-0">
                <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                  {project.members.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center gap-3 px-6 py-3"
                    >
                      <Avatar
                        name={member.user.name ?? "User"}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {ROLE_LABELS[member.roleLabel as UserRole] ??
                            member.roleLabel}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Environments */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Environments ({project.environments.length})
          </h2>
          {project.environments.length === 0 ? (
            <EmptyState
              icon={<Globe />}
              title="No environments"
              description="No deployment environments have been configured."
            />
          ) : (
            <Card>
              <CardContent className="px-0 py-0">
                <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                  {project.environments.map((env) => (
                    <li
                      key={env.id}
                      className="flex items-center gap-3 px-6 py-3"
                    >
                      <Globe className="w-4 h-4 flex-shrink-0 text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {env.name}
                        </p>
                        {env.url && (
                          <a
                            href={env.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 truncate block"
                          >
                            {env.url}
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent documents */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Recent Documents
        </h2>
        {project.documents.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title="No documents"
            description="No documents have been attached to this project."
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Title</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Author</TableHeader>
                <TableHeader>Updated</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {project.documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="font-medium text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {doc.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {DOC_TYPE_LABELS[doc.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {doc.author.name}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {formatRelativeTime(doc.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
