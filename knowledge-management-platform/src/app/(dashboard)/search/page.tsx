"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  Boxes,
  FolderKanban,
  BookOpen,
  Newspaper,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

// ── Types ──────────────────────────────────────────────────────────────────────

interface SearchDocument {
  id: string;
  title: string;
  type: string;
  published: boolean;
  updatedAt: string;
  author: { name: string | null };
  product: { name: string } | null;
  project: { name: string } | null;
  module: { name: string } | null;
}

interface SearchModule {
  id: string;
  name: string;
  status: string;
  description: string | null;
  project: { name: string; product: { name: string } };
}

interface SearchProject {
  id: string;
  name: string;
  status: string;
  clientName: string | null;
  product: { name: string; platform: { name: string } };
}

interface SearchArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published: boolean;
  updatedAt: string;
  author: { name: string | null };
}

interface SearchCourse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  published: boolean;
  instructor: { name: string | null };
}

interface SearchResults {
  documents: SearchDocument[];
  modules: SearchModule[];
  projects: SearchProject[];
  articles: SearchArticle[];
  courses: SearchCourse[];
}

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PLANNING: "Planning",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
  IN_DEVELOPMENT: "In Development",
  DEPRECATED: "Deprecated",
};

const DOC_TYPE_LABELS: Record<string, string> = {
  FUNCTIONAL: "Functional",
  TECHNICAL: "Technical",
  API_DOC: "API Doc",
  UI_UX: "UI/UX",
  QA: "QA",
  RELEASE_NOTE: "Release Note",
  TRAINING: "Training",
  GENERAL: "General",
};

function statusVariant(s: string): "green" | "yellow" | "orange" | "blue" | "default" {
  if (s === "ACTIVE") return "green";
  if (s === "PLANNING") return "yellow";
  if (s === "ON_HOLD") return "orange";
  if (s === "IN_DEVELOPMENT") return "blue";
  return "default";
}

// ── Tab definition ─────────────────────────────────────────────────────────────

type Tab = "documents" | "modules" | "projects" | "articles" | "courses";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "documents", label: "Documents", icon: <FileText className="w-4 h-4" /> },
  { key: "modules", label: "Modules", icon: <Boxes className="w-4 h-4" /> },
  { key: "projects", label: "Projects", icon: <FolderKanban className="w-4 h-4" /> },
  { key: "articles", label: "Articles", icon: <Newspaper className="w-4 h-4" /> },
  { key: "courses", label: "Courses", icon: <BookOpen className="w-4 h-4" /> },
];

// ── Main component ─────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("documents");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  // Fetch
  const doSearch = useCallback(async (q: string) => {
    if (!q) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Search request failed");
      const data: SearchResults = await res.json();
      setResults(data);
    } catch {
      setError("Failed to load results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(debouncedQuery);
  }, [debouncedQuery, doSearch]);

  const total = results
    ? results.documents.length +
      results.modules.length +
      results.projects.length +
      results.articles.length +
      results.courses.length
    : 0;

  const tabCount: Record<Tab, number> = {
    documents: results?.documents.length ?? 0,
    modules: results?.modules.length ?? 0,
    projects: results?.projects.length ?? 0,
    articles: results?.articles.length ?? 0,
    courses: results?.courses.length ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Search
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Search across documents, modules, projects, articles, and courses
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search…"
          autoFocus
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
        />
        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* No query yet */}
      {!debouncedQuery && !loading && (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Start typing to search the knowledge base</p>
        </div>
      )}

      {/* Results */}
      {results && debouncedQuery && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} result{total !== 1 ? "s" : ""} for{" "}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              &ldquo;{debouncedQuery}&rdquo;
            </span>
          </p>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                  ${
                    activeTab === tab.key
                      ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
                {tabCount[tab.key] > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300">
                    {tabCount[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div className="space-y-3">
            {/* Documents */}
            {activeTab === "documents" && (
              <>
                {results.documents.length === 0 ? (
                  <EmptyState
                    icon={<FileText />}
                    title="No documents found"
                    description={`No documents match "${debouncedQuery}".`}
                  />
                ) : (
                  results.documents.map((doc) => (
                    <Link key={doc.id} href={`/documents/${doc.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="flex items-start gap-3">
                          <FileText className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {doc.title}
                              </h3>
                              <Badge variant="default">
                                {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {[
                                doc.module?.name,
                                doc.project?.name,
                                doc.product?.name,
                              ]
                                .filter(Boolean)
                                .join(" › ")}{" "}
                              · {doc.author.name}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </>
            )}

            {/* Modules */}
            {activeTab === "modules" && (
              <>
                {results.modules.length === 0 ? (
                  <EmptyState
                    icon={<Boxes />}
                    title="No modules found"
                    description={`No modules match "${debouncedQuery}".`}
                  />
                ) : (
                  results.modules.map((mod) => (
                    <Link key={mod.id} href={`/modules/${mod.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="flex items-start gap-3">
                          <Boxes className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {mod.name}
                              </h3>
                              <Badge variant={statusVariant(mod.status)}>
                                {STATUS_LABELS[mod.status] ?? mod.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {mod.project.product.name} › {mod.project.name}
                            </p>
                            {mod.description && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">
                                {mod.description}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </>
            )}

            {/* Projects */}
            {activeTab === "projects" && (
              <>
                {results.projects.length === 0 ? (
                  <EmptyState
                    icon={<FolderKanban />}
                    title="No projects found"
                    description={`No projects match "${debouncedQuery}".`}
                  />
                ) : (
                  results.projects.map((proj) => (
                    <Link key={proj.id} href={`/projects/${proj.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="flex items-start gap-3">
                          <FolderKanban className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {proj.name}
                              </h3>
                              <Badge variant={statusVariant(proj.status)}>
                                {STATUS_LABELS[proj.status] ?? proj.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {proj.product.platform.name} › {proj.product.name}
                              {proj.clientName && ` · Client: ${proj.clientName}`}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </>
            )}

            {/* Articles */}
            {activeTab === "articles" && (
              <>
                {results.articles.length === 0 ? (
                  <EmptyState
                    icon={<Newspaper />}
                    title="No articles found"
                    description={`No articles match "${debouncedQuery}".`}
                  />
                ) : (
                  results.articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/knowledge-base/${article.slug}`}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="flex items-start gap-3">
                          <Newspaper className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {article.title}
                              </h3>
                              {!article.published && (
                                <Badge variant="yellow">Draft</Badge>
                              )}
                            </div>
                            {article.excerpt && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {article.excerpt}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                              {article.author.name}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </>
            )}

            {/* Courses */}
            {activeTab === "courses" && (
              <>
                {results.courses.length === 0 ? (
                  <EmptyState
                    icon={<BookOpen />}
                    title="No courses found"
                    description={`No courses match "${debouncedQuery}".`}
                  />
                ) : (
                  results.courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.slug}`}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="flex items-start gap-3">
                          <BookOpen className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {course.title}
                              </h3>
                              {!course.published && (
                                <Badge variant="yellow">Draft</Badge>
                              )}
                            </div>
                            {course.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {course.description}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                              Instructor: {course.instructor.name}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
