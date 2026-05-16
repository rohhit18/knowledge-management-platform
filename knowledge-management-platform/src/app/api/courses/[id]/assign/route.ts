import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MANAGER_ROLES } from "@/types";
import type { UserRole } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Auth guard — manager-level and above only
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { id?: string; role?: string }
    | undefined;

  if (
    !user?.id ||
    !MANAGER_ROLES.includes(user.role as UserRole)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: courseId } = params;

  // Parse body
  let body: { userIds?: string[]; dueDate?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userIds, dueDate } = body;

  if (!userIds?.length) {
    return NextResponse.json(
      { error: "userIds is required and must be a non-empty array" },
      { status: 400 }
    );
  }

  // Verify course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Upsert one enrollment per user
  // If the enrollment already exists we update assignedBy + dueDate;
  // if it is brand-new we create it with those values.
  const parsedDueDate = dueDate ? new Date(dueDate) : null;

  const results = await Promise.all(
    userIds.map((userId) =>
      prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: {
          userId,
          courseId,
          assignedBy: user.id!,
          dueDate: parsedDueDate,
        },
        update: {
          assignedBy: user.id!,
          ...(parsedDueDate !== null ? { dueDate: parsedDueDate } : {}),
        },
      })
    )
  );

  return NextResponse.json({ assigned: results.length });
}
