import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MANAGER_ROLES } from "@/types";
import type { UserRole } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const modules = await prisma.courseModule.findMany({
    where: { courseId: params.id },
    include: { _count: { select: { lessons: true } } },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(modules);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !MANAGER_ROLES.includes(user.role as UserRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  let body: { title?: string; order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, order } = body;
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let resolvedOrder = order;
  if (resolvedOrder === undefined || resolvedOrder === null) {
    const last = await prisma.courseModule.findFirst({
      where: { courseId: params.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    resolvedOrder = last ? last.order + 1 : 0;
  }

  const module = await prisma.courseModule.create({
    data: {
      title: title.trim(),
      order: resolvedOrder,
      courseId: params.id,
    },
    include: { _count: { select: { lessons: true } } },
  });

  return NextResponse.json(module, { status: 201 });
}
