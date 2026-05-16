import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string | null;
    createdAt: Date;
    author: { name: string | null; email: string };
    category: { name: string; slug: string } | null;
    tags: { id: string; name: string }[];
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {article.category && (
          <Badge variant="blue">{article.category.name}</Badge>
        )}
        {article.tags.slice(0, 3).map((tag) => (
          <Badge key={tag.id}>{tag.name}</Badge>
        ))}
      </div>
      <h2 className="text-lg font-semibold mb-2 leading-snug">
        <Link href={`/knowledge-base/${article.slug}`} className="hover:text-primary-600 transition-colors">
          {article.title}
        </Link>
      </h2>
      {article.excerpt && (
        <p className="text-gray-500 text-sm leading-relaxed mb-4">{article.excerpt}</p>
      )}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{article.author.name ?? article.author.email}</span>
        <span>&middot;</span>
        <span>{formatDate(article.createdAt)}</span>
      </div>
    </article>
  );
}
