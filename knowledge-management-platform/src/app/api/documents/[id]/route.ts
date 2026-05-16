import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canWrite } from "@/lib/permissions";

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true, slug: true } },
      project: { select: { id: true, name: true, slug: true } },
      module: { select: { id: true, name: true, slug: true } },
      feature: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } },
      versions: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { version: "desc" },
      },
    },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canWrite(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.document.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, content, excerpt, type, published, changeNote, tagNames } = await req.json();

  // Save current version before update
  if (content && content !== existing.content) {
    await prisma.documentVersion.create({
      data: {
        version: existing.version,
        content: existing.content,
        changeNote: changeNote ?? null,
        documentId: existing.id,
        authorId: session.user.id,
      },
    });
  }

  const tags =
    tagNames !== undefined
      ? await Promise.all(
          (tagNames as string[]).map((n: string) =>
            prisma.tag.upsert({ where: { name: n }, create: { name: n }, update: {} })
          )
        )
      : undefined;

  const doc = await prisma.document.update({
    where: { id: params.id },
    data: {
      ...(title ? { title } : {}),
      ...(content ? { content, version: { increment: 1 } } : {}),
      ...(excerpt !== undefined ? { excerpt } : {}),
      ...(type ? { type } : {}),
      ...(published !== undefined ? { published } : {}),
      ...(tags ? { tags: { set: tags.map((t) => ({ id: t.id })) } } : {}),
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      tags: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(doc);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canWrite(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.document.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
