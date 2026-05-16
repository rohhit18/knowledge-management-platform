import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManage } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");

  const assessments = await prisma.assessment.findMany({
    where: {
      ...(moduleId ? { moduleId } : {}),
    },
    include: {
      module: {
        select: {
          id: true,
          name: true,
          project: {
            select: {
              name: true,
              product: {
                select: { name: true },
              },
            },
          },
        },
      },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assessments);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !user.role || !canManage(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, passingScore, timeLimit, moduleId } =
    await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const assessment = await prisma.assessment.create({
    data: {
      title: title.trim(),
      description: description?.trim() ?? null,
      passingScore: passingScore ?? 70,
      timeLimit: timeLimit ?? null,
      moduleId: moduleId ?? null,
    },
    include: {
      module: { select: { id: true, name: true } },
      _count: { select: { questions: true, attempts: true } },
    },
  });

  return NextResponse.json(assessment, { status: 201 });
}
