import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course || !course.published) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    create: { userId, courseId: course.id },
    update: {}
  });

  return NextResponse.json(enrollment, { status: 201 });
}
