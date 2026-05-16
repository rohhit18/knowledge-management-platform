import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { canWrite } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const modules = await prisma.module.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      parentId: null,
    },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      owner: { select: { id: true, name: true, email: true } },
      tags: { select: { id: true, name: true } },
      _count: { select: { features: true, documents: true, subModules: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(modules);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canWrite(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, projectId, parentId, tagNames } = await req.json();
  if (!name || !projectId) {
    return NextResponse.json({ error: "Name and projectId required" }, { status: 400 });
  }

  const tags = tagNames?.length
    ? await Promise.all(
        (tagNames as string[]).map((n: string) =>
          prisma.tag.upsert({ where: { name: n }, create: { name: n }, update: {} })
        )
      )
    : [];

  const module = await prisma.module.create({
    data: {
      name,
      slug: slugify(name),
      description,
      projectId,
      parentId: parentId ?? null,
      ownerId: session.user.id,
      tags: { connect: tags.map((t) => ({ id: t.id })) },
    },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { features: true, documents: true } },
    },
  });
  return NextResponse.json(module, { status: 201 });
}
