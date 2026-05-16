import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Boxes,
  ChevronRight,
  Zap,
  FileText,
  ClipboardList,
  User,
  Tag,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/Table";
import { MODULE_STATUS_LABELS, DOC_TYPE_LABELS, ModuleStatus } from "@/types";
import { formatDate, formatRelativeTime, truncate } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const mod = await prisma.module.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return { title: mod?.name ?? "Module" };
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

export default async function ModuleDetailPage({ params }: PageProps) {
  const mod = await prisma.module.findUnique({
    where: { id: params.id },
    include: {
      project: {
        include: {
          product: {
            include: { platform: { select: { id: true, name: true } } },
          },
        },
      },
      owner: { select: { name: true } },
      features: {
        include: { _count: { select: { documents: true } } },
        orderBy: { name: "asc" },
      },
      subModules: {
        include: {
          _count: { select: { features: true, documents: true } },
        },
        orderBy: { name: "asc" },
      },
      documents: {
        include: { author: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
      },
      assessments: {
        include: { _count: { select: { questions: true } } },
        orderBy: { title: "asc" },
      },
      tags: true,
    },
  });

  if (!mod) notFound();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center flex-wrap gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <Link
          href="/products"
          className="hover:text-slate-700 dark:hover:text-slate-200"
        >
          {mod.project.product.platform.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href={`/products/${mod.project.product.id}`}
          className="hover:text-slate-700 dark:hover:text-slate-200"
        >
          {mod.project.product.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href={`/projects/${mod.project.id}`}
          className="hover:text-slate-700 dark:hover:text-slate-200"
        >
          {mod.project.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-slate-100 font-medium">
          {mod.name}
        </span>
      </nav>

      {/* Module header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex-shrink-0">
            <Boxes className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {mod.name}
              </h1>
              <Badge variant={moduleStatusVariant(mod.status)}>
                {MODULE_STATUS_LABELS[mod.status]}
              </Badge>
            </div>

            {mod.description && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {mod.description}
              </p>
            )}

            {mod.owner && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <User className="w-4 h-4" />
                <span>Owner: {mod.owner.name}</span>
              </div>
            )}

            {mod.tags.length > 0 && (
              <div className="mt-3 flex items-center flex-wrap gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {mod.tags.map((tag) => (
                  <Badge key={tag.id} variant="default">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Features ({mod.features.length})
        </h2>
        {mod.features.length === 0 ? (
          <EmptyState
            icon={<Zap />}
            title="No features yet"
            description="No features have been defined for this module."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {mod.features.map((feature) => (
              <Card key={feature.id} className="group">
                <CardContent className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {feature.name}
                    </h3>
                  </div>
                  {feature.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {truncate(feature.description, 100)}
                    </p>
                  )}
                  <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    {feature._count.documents} document
                    {feature._count.documents !== 1 ? "s" : ""}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sub-modules */}
      {mod.subModules.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Sub-modules ({mod.subModules.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {mod.subModules.map((sub) => (
              <Link key={sub.id} href={`/modules/${sub.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {sub.name}
                      </h3>
                      <Badge variant={moduleStatusVariant(sub.status)}>
                        {MODULE_STATUS_LABELS[sub.status]}
                      </Badge>
                    </div>
                    {sub.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex-1">
                        {truncate(sub.description, 80)}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                      <span>{sub._count.features} features</span>
                      <span>{sub._count.documents} docs</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Documents ({mod.documents.length})
        </h2>
        {mod.documents.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title="No documents"
            description="No documents have been attached to this module."
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Title</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Author</TableHeader>
                <TableHeader>Version</TableHeader>
                <TableHeader>Updated</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {mod.documents.map((doc) => (
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
                    v{doc.version}
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

      {/* Assessments */}
      {mod.assessments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Assessments ({mod.assessments.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mod.assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <ClipboardList className="w-5 h-5 mt-0.5 text-indigo-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {assessment.title}
                      </h3>
                      {assessment.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {truncate(assessment.description, 100)}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          Passing score: {assessment.passingScore}%
                        </span>
                        <span>
                          {assessment._count.questions} question
                          {assessment._count.questions !== 1 ? "s" : ""}
                        </span>
                        {assessment.timeLimit && (
                          <span>{assessment.timeLimit} min</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
