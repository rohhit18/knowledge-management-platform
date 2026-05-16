import { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
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
import { DOC_TYPE_LABELS, DocumentType } from "@/types";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Documents" };

interface PageProps {
  searchParams: { type?: string; q?: string; published?: string };
}

const TYPE_OPTIONS: DocumentType[] = [
  "FUNCTIONAL",
  "TECHNICAL",
  "API_DOC",
  "UI_UX",
  "QA",
  "RELEASE_NOTE",
  "TRAINING",
  "GENERAL",
];

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

export default async function DocumentsPage({ searchParams }: PageProps) {
  const { type, q: search, published } = searchParams;
  const validType = TYPE_OPTIONS.includes(type as DocumentType)
    ? (type as DocumentType)
    : undefined;
  const showPublished = published !== "all";

  const documents = await prisma.document.findMany({
    where: {
      ...(showPublished ? { published: true } : {}),
      ...(validType ? { type: validType } : {}),
      ...(search
        ? { title: { contains: search, mode: "insensitive" } }
        : {}),
    },
    include: {
      author: { select: { name: true } },
      product: { select: { name: true } },
      project: { select: { name: true } },
      module: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Documents
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Browse all knowledge documentation
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="type"
          defaultValue={validType ?? ""}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {DOC_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          name="published"
          defaultValue={showPublished ? "" : "all"}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Published only</option>
          <option value="all">All documents</option>
        </select>
        <input
          type="text"
          name="q"
          placeholder="Search documents…"
          defaultValue={search ?? ""}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
        {(validType || search || !showPublished) && (
          <Link
            href="/documents"
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {documents.length} document{documents.length !== 1 ? "s" : ""} found
      </p>

      {/* Table */}
      {documents.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No documents found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Title</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Scope</TableHeader>
              <TableHeader>Author</TableHeader>
              <TableHeader>Version</TableHeader>
              <TableHeader>Updated</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => {
              const scope =
                doc.module?.name ??
                doc.project?.name ??
                doc.product?.name ??
                "—";

              return (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="font-medium text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 flex-shrink-0 text-slate-400" />
                      {doc.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={docTypeVariant(doc.type)}>
                      {DOC_TYPE_LABELS[doc.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300 max-w-[160px] truncate">
                    {scope}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {doc.author.name}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    v{doc.version}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {formatDate(doc.updatedAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
