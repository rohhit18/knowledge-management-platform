import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { canWrite } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");

  const features = await prisma.feature.findMany({
    where: moduleId ? { moduleId } : undefined,
    include: {
      module: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } },
      _count: { select: { documents: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(features);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canWrite(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, moduleId, tagNames } = await req.json();
  if (!name || !moduleId) {
    return NextResponse.json({ error: "Name and moduleId required" }, { status: 400 });
  }

  const tags = tagNames?.length
    ? await Promise.all(
        (tagNames as string[]).map((n: string) =>
          prisma.tag.upsert({ where: { name: n }, create: { name: n }, update: {} })
        )
      )
    : [];

  const feature = await prisma.feature.create({
    data: {
      name,
      slug: slugify(name),
      description,
      moduleId,
      tags: { connect: tags.map((t) => ({ id: t.id })) },
    },
    include: {
      module: { select: { id: true, name: true } },
      _count: { select: { documents: true } },
    },
  });
  return NextResponse.json(feature, { status: 201 });
}
