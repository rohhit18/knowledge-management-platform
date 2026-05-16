import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const includeUnpublished = searchParams.get("all") === "1";

  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  const articles = await prisma.article.findMany({
    where: {
      ...(!includeUnpublished || !["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "PROJECT_MANAGER"].includes(role ?? "") ? { published: true } : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(tag ? { tags: { some: { name: tag } } } : {})
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "PROJECT_MANAGER", "BUSINESS_ANALYST"].includes(user.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, content, excerpt, categoryId, tagNames, published } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const slug = slugify(title);

  const tags = tagNames?.length
    ? await Promise.all(
        (tagNames as string[]).map((name: string) =>
          prisma.tag.upsert({ where: { name }, create: { name }, update: {} })
        )
      )
    : [];

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      published: published ?? false,
      authorId: user.id,
      categoryId: categoryId ?? null,
      tags: { connect: tags.map((t) => ({ id: t.id })) }
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } }
    }
  });

  return NextResponse.json(article, { status: 201 });
}
