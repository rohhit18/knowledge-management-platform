import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

async function getArticle(slug: string) {
  return prisma.article.findFirst({
    where: { slug, published: true },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } }
    }
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: "Not Found" };
  return { title: article.title, description: article.excerpt ?? undefined };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/knowledge-base" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Knowledge Base
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {article.category && <Badge variant="blue">{article.category.name}</Badge>}
            {article.tags.map((tag) => (
              <Link key={tag.id} href={`/knowledge-base?tag=${tag.name}`}>
                <Badge>{tag.name}</Badge>
              </Link>
            ))}
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">{article.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>By {article.author.name ?? article.author.email}</span>
            <span>&middot;</span>
            <time>{formatDate(article.createdAt)}</time>
            {article.updatedAt > article.createdAt && (
              <>
                <span>&middot;</span>
                <span>Updated {formatDate(article.updatedAt)}</span>
              </>
            )}
          </div>
        </header>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  );
}
