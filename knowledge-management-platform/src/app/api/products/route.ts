import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { canManage } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platformId = searchParams.get("platformId");

  const products = await prisma.product.findMany({
    where: platformId ? { platformId } : undefined,
    include: {
      platform: { select: { id: true, name: true, slug: true } },
      owner: { select: { id: true, name: true, email: true } },
      tags: { select: { id: true, name: true } },
      _count: { select: { projects: true, documents: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManage(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, platformId, techStack, tagNames } = await req.json();
  if (!name || !platformId) {
    return NextResponse.json({ error: "Name and platformId required" }, { status: 400 });
  }

  const tags = tagNames?.length
    ? await Promise.all(
        (tagNames as string[]).map((n: string) =>
          prisma.tag.upsert({ where: { name: n }, create: { name: n }, update: {} })
        )
      )
    : [];

  const product = await prisma.product.create({
    data: {
      name,
      slug: slugify(name),
      description,
      platformId,
      techStack: techStack ?? [],
      ownerId: session.user.id,
      tags: { connect: tags.map((t) => ({ id: t.id })) },
    },
    include: {
      platform: { select: { id: true, name: true, slug: true } },
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { projects: true, documents: true } },
    },
  });
  return NextResponse.json(product, { status: 201 });
}
