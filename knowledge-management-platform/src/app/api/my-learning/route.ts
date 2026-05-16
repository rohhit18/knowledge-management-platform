import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all enrollments for this user, including full course structure
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: { select: { name: true, email: true } },
          courseModules: {
            include: { lessons: { select: { id: true } } },
          },
        },
      },
      assigner: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Collect all lesson IDs across every enrolled course
  const lessonIds = enrollments.flatMap((e) =>
    e.course.courseModules.flatMap((m) => m.lessons.map((l) => l.id))
  );

  // Single query for all completed progress records for this user
  const progressRecords = await prisma.progress.findMany({
    where: { userId, lessonId: { in: lessonIds }, completed: true },
    select: { lessonId: true },
  });

  const completedSet = new Set(progressRecords.map((p) => p.lessonId));

  // Shape the response
  const result = enrollments.map((e) => {
    const allLessons = e.course.courseModules.flatMap((m) =>
      m.lessons.map((l) => l.id)
    );
    const completedLessons = allLessons.filter((id) =>
      completedSet.has(id)
    ).length;

    return {
      id: e.id,
      courseId: e.courseId,
      courseSlug: e.course.slug,
      courseTitle: e.course.title,
      courseDescription: e.course.description ?? null,
      instructorName:
        e.course.instructor.name ?? e.course.instructor.email,
      totalLessons: allLessons.length,
      completedLessons,
      assignedBy: e.assigner
        ? (e.assigner.name ?? e.assigner.email)
        : null,
      dueDate: e.dueDate?.toISOString() ?? null,
      completedAt: e.completedAt?.toISOString() ?? null,
      createdAt: e.createdAt.toISOString(),
    };
  });

  return NextResponse.json({ enrollments: result });
}
