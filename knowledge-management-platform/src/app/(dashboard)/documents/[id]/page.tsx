import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FileText,
  ChevronRight,
  User,
  Tag,
  Clock,
  Hash,
  History,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DOC_TYPE_LABELS, DocumentType } from "@/types";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  return { title: doc?.title ?? "Document" };
}

function docTypeVariant(type: DocumentType): "blue" | "purple" | "green" | "orange" | "yellow" | "indigo" | "default" {
  switch (type) {
    case "FUNCTIONAL":
      return "blue";
    case "TECHNICAL":
      return "purple";
    case "API_DOC":
      return "indigo";
    case "UI_UX":
      return "orange";
    case "QA":
      return "yellow";
    case "RELEASE_NOTE":
      return "green";
    case "TRAINING":
      return "blue";
    default:
      return "default";
  }
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { name: true } },
      product: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      module: { select: { id: true, name: true } },
      feature: { select: { id: true, name: true } },
      tags: true,
      versions: {
        include: { author: { select: { name: true } } },
        orderBy: { version: "desc" },
      },
    },
  });

  if (!doc) notFound();

  const scopeLabel = doc.module?.name ?? doc.project?.name ?? doc.product?.name;
  const scopeHref = doc.module
    ? `/modules/${doc.module.id}`
    : doc.project
    ? `/projects/${doc.project.id}`
    : doc.product
    ? `/products/${doc.product.id}`
    : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center flex-wrap gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <Link
          href="/documents"
          className="hover:text-slate-700 dark:hover:text-slate-200"
        >
          Documents
        </Link>
        <ChevronRight className="w-4 h-4" />
        {scopeLabel && scopeHref && (
          <>
            <Link
              href={scopeHref}
              className="hover:text-slate-700 dark:hover:text-slate-200"
            >
              {scopeLabel}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span className="text-slate-900 dark:text-slate-100 font-medium truncate max-w-[240px]">
          {doc.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main content */}
        <div className="space-y-4">
          {/* Document header */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {doc.title}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!doc.published && (
                  <Badge variant="yellow">Draft</Badge>
                )}
                <Badge variant={docTypeVariant(doc.type)}>
                  {DOC_TYPE_LABELS[doc.type]}
                </Badge>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {doc.author.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4" />
                Version {doc.version}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Updated {formatRelativeTime(doc.updatedAt)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 md:p-8">
            <article
              className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary-600"
              dangerouslySetInnerHTML={{ __html: doc.content }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Metadata card */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Document Info
              </h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Type
                </p>
                <Badge variant={docTypeVariant(doc.type)}>
                  {DOC_TYPE_LABELS[doc.type]}
                </Badge>
              </div>

              {scopeLabel && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Scope
                  </p>
                  {scopeHref ? (
                    <Link
                      href={scopeHref}
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {scopeLabel}
                    </Link>
                  ) : (
                    <span className="text-slate-700 dark:text-slate-200">
                      {scopeLabel}
                    </span>
                  )}
                  {doc.feature && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Feature: {doc.feature.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Author
                </p>
                <p className="text-slate-700 dark:text-slate-200">
                  {doc.author.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Version
                </p>
                <p className="text-slate-700 dark:text-slate-200">v{doc.version}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Published
                </p>
                <p className="text-slate-700 dark:text-slate-200">
                  {doc.published ? "Yes" : "No (Draft)"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Last Updated
                </p>
                <p className="text-slate-700 dark:text-slate-200">
                  {formatDate(doc.updatedAt)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Created
                </p>
                <p className="text-slate-700 dark:text-slate-200">
                  {formatDate(doc.createdAt)}
                </p>
              </div>

              {doc.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    {doc.tags.map((tag) => (
                      <Badge key={tag.id} variant="default">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Version history */}
      {doc.versions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History ({doc.versions.length})
          </h2>
          <Card>
            <CardContent className="px-0 py-0">
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {doc.versions.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-start gap-4 px-6 py-4"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex-shrink-0">
                      v{v.version}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {v.changeNote ?? "No change note"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {v.author.name} · {formatDate(v.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
