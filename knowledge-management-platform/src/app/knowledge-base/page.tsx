import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/articles/ArticleCard";
import Link from "next/link";

interface Props {
  searchParams: { category?: string; tag?: string };
}

export const metadata = { title: "Knowledge Base" };

async function getArticles(category?: string, tag?: string) {
  return prisma.article.findMany({
    where: {
      published: true,
      ...(category && { category: { slug: category } }),
      ...(tag && { tags: { some: { name: tag } } })
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { articles: { some: { published: true } } },
    orderBy: { name: "asc" }
  });
}

export default async function KnowledgeBasePage({ searchParams }: Props) {
  const [articles, categories] = await Promise.all([
    getArticles(searchParams.category, searchParams.tag),
    getCategories()
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-gray-500">Browse articles, guides, and documentation</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Categories</h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="/knowledge-base"
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!searchParams.category ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
              >
                All articles
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/knowledge-base?category=${cat.slug}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${searchParams.category === cat.slug ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Articles grid */}
        <div className="flex-1">
          {articles.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No articles found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
