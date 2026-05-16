import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = searchParams.get("type") ?? "all";

  if (!q || q.length < 2) {
    return NextResponse.json({ articles: [], courses: [], documents: [], modules: [], projects: [] });
  }

  const ci = { contains: q, mode: "insensitive" as const };

  const [articles, courses, documents, modules, projects] = await Promise.all([
    type === "all" || type === "articles"
      ? prisma.article.findMany({
          where: {
            published: true,
            OR: [{ title: ci }, { content: ci }, { excerpt: ci }, { tags: { some: { name: ci } } }],
          },
          select: {
            id: true, title: true, slug: true, excerpt: true, published: true, updatedAt: true,
            author: { select: { name: true } },
          },
          take: 8,
        })
      : [],

    type === "all" || type === "courses"
      ? prisma.course.findMany({
          where: {
            OR: [{ title: ci }, { description: ci }, { tags: { some: { name: ci } } }],
          },
          select: {
            id: true, title: true, slug: true, description: true, published: true,
            instructor: { select: { name: true } },
          },
          take: 8,
        })
      : [],

    type === "all" || type === "documents"
      ? prisma.document.findMany({
          where: {
            published: true,
            OR: [{ title: ci }, { content: ci }, { excerpt: ci }, { tags: { some: { name: ci } } }],
          },
          select: {
            id: true, title: true, type: true, published: true, updatedAt: true,
            author: { select: { name: true } },
            product: { select: { name: true } },
            project: { select: { name: true } },
            module: { select: { name: true } },
          },
          take: 8,
        })
      : [],

    type === "all" || type === "modules"
      ? prisma.module.findMany({
          where: {
            OR: [{ name: ci }, { description: ci }, { tags: { some: { name: ci } } }],
          },
          select: {
            id: true, name: true, slug: true, description: true, status: true,
            project: {
              select: {
                name: true,
                product: { select: { name: true } },
              },
            },
          },
          take: 8,
        })
      : [],

    type === "all" || type === "projects"
      ? prisma.project.findMany({
          where: {
            OR: [{ name: ci }, { description: ci }, { clientName: ci }],
          },
          select: {
            id: true, name: true, slug: true, status: true, clientName: true,
            product: {
              select: {
                name: true,
                platform: { select: { name: true } },
              },
            },
          },
          take: 8,
        })
      : [],
  ]);

  return NextResponse.json({ articles, courses, documents, modules, projects });
}
