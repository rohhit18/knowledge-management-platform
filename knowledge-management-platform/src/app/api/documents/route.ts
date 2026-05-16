import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { canWrite } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const productId = searchParams.get("productId");
  const projectId = searchParams.get("projectId");
  const moduleId = searchParams.get("moduleId");
  const published = searchParams.get("published");

  const documents = await prisma.document.findMany({
    where: {
      ...(type ? { type: type as never } : {}),
      ...(productId ? { productId } : {}),
      ...(projectId ? { projectId } : {}),
      ...(moduleId ? { moduleId } : {}),
      ...(published === "1" ? { published: true } : {}),
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      module: { select: { id: true, name: true } },
      feature: { select: { id: true, name: true } },
      tags: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canWrite(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    title, content, excerpt, type, published,
    productId, projectId, moduleId, featureId, tagNames,
  } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 });
  }

  const tags = tagNames?.length
    ? await Promise.all(
        (tagNames as string[]).map((n: string) =>
          prisma.tag.upsert({ where: { name: n }, create: { name: n }, update: {} })
        )
      )
    : [];

  const doc = await prisma.document.create({
    data: {
      title,
      slug: slugify(title) + "-" + Date.now(),
      content,
      excerpt,
      type: type ?? "GENERAL",
      published: published ?? false,
      authorId: session.user.id,
      productId: productId || null,
      projectId: projectId || null,
      moduleId: moduleId || null,
      featureId: featureId || null,
      tags: { connect: tags.map((t) => ({ id: t.id })) },
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      tags: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(doc, { status: 201 });
}
