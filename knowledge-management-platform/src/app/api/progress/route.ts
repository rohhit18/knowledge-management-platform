import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, completed } = await req.json();
  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

  const progress = await prisma.progress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, completed: completed ?? true },
    update: { completed: completed ?? true }
  });

  return NextResponse.json(progress);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  const where = courseId
    ? { userId, lesson: { courseModule: { courseId } } }
    : { userId };

  const progress = await prisma.progress.findMany({
    where,
    select: { lessonId: true, completed: true }
  });

  return NextResponse.json(progress);
}
