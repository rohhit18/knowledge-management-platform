import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MANAGER_ROLES } from "@/types";
import type { UserRole } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; moduleId: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !MANAGER_ROLES.includes(user.role as UserRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.courseModule.findFirst({
    where: { id: params.moduleId, courseId: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  let body: { title?: string; order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updated = await prisma.courseModule.update({
    where: { id: params.moduleId },
    data: {
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.order !== undefined ? { order: body.order } : {}),
    },
    include: { _count: { select: { lessons: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; moduleId: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !MANAGER_ROLES.includes(user.role as UserRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.courseModule.findFirst({
    where: { id: params.moduleId, courseId: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  await prisma.courseModule.delete({ where: { id: params.moduleId } });

  return NextResponse.json({ deleted: true });
}
