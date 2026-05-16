import { prisma } from "@/lib/prisma";
import { BookOpen, GraduationCap, Users, TrendingUp, Package, FolderKanban, Puzzle, FileText } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

async function getData() {
  const [articles, courses, users, enrollments, products, projects, modules, documents] =
    await Promise.all([
      prisma.article.count(),
      prisma.course.count(),
      prisma.user.count(),
      prisma.enrollment.count(),
      prisma.product.count(),
      prisma.project.count(),
      prisma.module.count(),
      prisma.document.count(),
    ]);

  const [recentDocs, recentProjects] = await Promise.all([
    prisma.document.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, type: true, published: true, updatedAt: true },
    }),
    prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, status: true, createdAt: true, product: { select: { name: true } } },
    }),
  ]);

  return { articles, courses, users, enrollments, products, projects, modules, documents, recentDocs, recentProjects };
}

export default async function AdminDashboard() {
  const data = await getData();

  const stats = [
    { label: "Products", value: data.products, icon: Package, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
    { label: "Projects", value: data.projects, icon: FolderKanban, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
    { label: "Modules", value: data.modules, icon: Puzzle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
    { label: "Documents", value: data.documents, icon: FileText, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950" },
    { label: "Articles", value: data.articles, icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950" },
    { label: "Courses", value: data.courses, icon: GraduationCap, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950" },
    { label: "Users", value: data.users, icon: Users, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950" },
    { label: "Enrollments", value: data.enrollments, icon: TrendingUp, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/admin/articles/new" className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            New Article
          </Link>
          <Link href="/admin/courses/new" className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
            New Course
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Documents</h2>
            <Link href="/documents" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.recentDocs.map((d) => (
              <li key={d.id} className="px-6 py-3 flex items-center justify-between">
                <Link href={`/documents/${d.id}`} className="text-sm hover:text-primary-600 transition-colors truncate flex-1 text-slate-700 dark:text-slate-300">
                  {d.title}
                </Link>
                <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${d.published ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                  {d.published ? "Published" : "Draft"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Projects</h2>
            <Link href="/projects" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.recentProjects.map((p) => (
              <li key={p.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <Link href={`/projects/${p.id}`} className="text-sm hover:text-primary-600 transition-colors truncate block text-slate-700 dark:text-slate-300">
                    {p.name}
                  </Link>
                  <p className="text-xs text-slate-400">{p.product.name} · {formatDate(p.createdAt)}</p>
                </div>
                <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                  p.status === "ACTIVE" ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" :
                  p.status === "PLANNING" ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400" :
                  "bg-slate-100 dark:bg-slate-700 text-slate-500"
                }`}>
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
