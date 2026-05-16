import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MANAGER_ROLES } from "@/types";
import type { UserRole, LessonType } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !MANAGER_ROLES.includes(user.role as UserRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.lesson.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  let body: { title?: string; content?: string; type?: LessonType; order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validTypes: LessonType[] = ["TEXT", "VIDEO", "QUIZ"];

  const updated = await prisma.lesson.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.content !== undefined ? { content: body.content } : {}),
      ...(body.type && validTypes.includes(body.type) ? { type: body.type } : {}),
      ...(body.order !== undefined ? { order: body.order } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !MANAGER_ROLES.includes(user.role as UserRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.lesson.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  await prisma.lesson.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}
