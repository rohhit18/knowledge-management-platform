import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManage } from "@/lib/permissions";

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      platform: { select: { id: true, name: true, slug: true } },
      owner: { select: { id: true, name: true, email: true } },
      tags: { select: { id: true, name: true } },
      projects: {
        include: {
          _count: { select: { modules: true, members: true } },
        },
        orderBy: { name: "asc" },
      },
      documents: {
        where: { published: true },
        select: { id: true, title: true, type: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 10,
      },
      _count: { select: { projects: true, documents: true } },
    },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManage(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();
  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: data.name,
      description: data.description,
      techStack: data.techStack,
      status: data.status,
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManage(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
