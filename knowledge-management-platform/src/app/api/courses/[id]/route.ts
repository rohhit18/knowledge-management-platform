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

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } },
      courseModules: {
        include: { lessons: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !MANAGER_ROLES.includes(user.role as UserRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.course.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  let body: {
    title?: string;
    description?: string;
    thumbnail?: string;
    published?: boolean;
    categoryId?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updated = await prisma.course.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.thumbnail !== undefined ? { thumbnail: body.thumbnail || null } : {}),
      ...(body.published !== undefined ? { published: body.published } : {}),
      ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
    },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } },
      _count: { select: { enrollments: true } },
    },
  });

  return NextResponse.json(updated);
}
