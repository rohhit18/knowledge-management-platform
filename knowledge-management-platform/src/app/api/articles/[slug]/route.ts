import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const article = await prisma.article.findFirst({
    where: { slug: params.slug },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } }
    }
  });

  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const article = await prisma.article.findFirst({ where: { slug: params.slug } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (article.authorId !== user.id && !["SUPER_ADMIN", "ADMIN"].includes(user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, content, excerpt, categoryId, tagNames, published } = body;

  const tags = tagNames?.length
    ? await Promise.all(
        (tagNames as string[]).map((name: string) =>
          prisma.tag.upsert({ where: { name }, create: { name }, update: {} })
        )
      )
    : undefined;

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(categoryId !== undefined && { categoryId }),
      ...(published !== undefined && { published }),
      ...(tags && { tags: { set: tags.map((t) => ({ id: t.id })) } })
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } }
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || !["SUPER_ADMIN", "ADMIN"].includes(user.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const article = await prisma.article.findFirst({ where: { slug: params.slug } });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.article.delete({ where: { id: article.id } });
  return new NextResponse(null, { status: 204 });
}
