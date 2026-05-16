import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

export const metadata = { title: "Articles — Admin" };

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true } },
      tags: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Article
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Author</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium max-w-xs truncate">{a.title}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{a.author.name ?? a.author.email}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{a.category?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {a.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{formatDate(a.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/knowledge-base/${a.slug}`} className="text-primary-600 hover:text-primary-700 text-xs">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && (
          <div className="text-center py-16 text-gray-400">No articles yet</div>
        )}
      </div>
    </div>
  );
}
