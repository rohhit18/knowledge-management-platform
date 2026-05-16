import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { canManage } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  const projects = await prisma.project.findMany({
    where: productId ? { productId } : undefined,
    include: {
      product: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } },
      _count: { select: { modules: true, members: true, documents: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManage(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, productId, clientName, status, startDate, endDate, tagNames } =
    await req.json();
  if (!name || !productId) {
    return NextResponse.json({ error: "Name and productId required" }, { status: 400 });
  }

  const tags = tagNames?.length
    ? await Promise.all(
        (tagNames as string[]).map((n: string) =>
          prisma.tag.upsert({ where: { name: n }, create: { name: n }, update: {} })
        )
      )
    : [];

  const project = await prisma.project.create({
    data: {
      name,
      slug: slugify(name),
      description,
      productId,
      clientName,
      status: status ?? "ACTIVE",
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      tags: { connect: tags.map((t) => ({ id: t.id })) },
    },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      _count: { select: { modules: true, members: true } },
    },
  });
  return NextResponse.json(project, { status: 201 });
}
