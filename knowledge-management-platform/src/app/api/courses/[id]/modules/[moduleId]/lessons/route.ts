import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MANAGER_ROLES } from "@/types";
import type { UserRole, LessonType } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; moduleId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const module = await prisma.courseModule.findFirst({
    where: { id: params.moduleId, courseId: params.id },
  });
  if (!module) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const lessons = await prisma.lesson.findMany({
    where: { courseModuleId: params.moduleId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(lessons);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; moduleId: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !MANAGER_ROLES.includes(user.role as UserRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const module = await prisma.courseModule.findFirst({
    where: { id: params.moduleId, courseId: params.id },
  });
  if (!module) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  let body: { title?: string; content?: string; type?: LessonType; order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { title, content, type, order } = body;
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let resolvedOrder = order;
  if (resolvedOrder === undefined || resolvedOrder === null) {
    const last = await prisma.lesson.findFirst({
      where: { courseModuleId: params.moduleId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    resolvedOrder = last ? last.order + 1 : 0;
  }

  const validTypes: LessonType[] = ["TEXT", "VIDEO", "QUIZ"];
  const resolvedType: LessonType =
    type && validTypes.includes(type) ? type : "TEXT";

  const lesson = await prisma.lesson.create({
    data: {
      title: title.trim(),
      content: content ?? "",
      type: resolvedType,
      order: resolvedOrder,
      courseModuleId: params.moduleId,
    },
  });

  return NextResponse.json(lesson, { status: 201 });
}
