import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManage } from "@/lib/permissions";

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      product: { select: { id: true, name: true, slug: true, platform: { select: { id: true, name: true } } } },
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      modules: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { features: true, documents: true } },
        },
        orderBy: { name: "asc" },
      },
      environments: true,
      documents: {
        where: { published: true },
        select: { id: true, title: true, type: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 10,
      },
      tags: { select: { id: true, name: true } },
      _count: { select: { modules: true, members: true, documents: true } },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManage(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();
  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      name: data.name,
      description: data.description,
      clientName: data.clientName,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });
  return NextResponse.json(project);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManage(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
