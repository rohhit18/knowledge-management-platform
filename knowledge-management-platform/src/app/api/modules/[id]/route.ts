import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canWrite } from "@/lib/permissions";

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const module = await prisma.module.findUnique({
    where: { id: params.id },
    include: {
      project: {
        include: {
          product: { select: { id: true, name: true, slug: true, platform: { select: { id: true, name: true } } } },
        },
      },
      owner: { select: { id: true, name: true, email: true } },
      parent: { select: { id: true, name: true, slug: true } },
      subModules: {
        include: { _count: { select: { features: true, documents: true } } },
        orderBy: { name: "asc" },
      },
      features: {
        include: { _count: { select: { documents: true } } },
        orderBy: { name: "asc" },
      },
      documents: {
        where: { published: true },
        select: { id: true, title: true, type: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 20,
      },
      assessments: {
        select: { id: true, title: true, passingScore: true, _count: { select: { questions: true } } },
      },
      tags: { select: { id: true, name: true } },
      _count: { select: { features: true, documents: true, subModules: true } },
    },
  });
  if (!module) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(module);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canWrite(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();
  const module = await prisma.module.update({
    where: { id: params.id },
    data: { name: data.name, description: data.description, status: data.status },
  });
  return NextResponse.json(module);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canWrite(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.module.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
