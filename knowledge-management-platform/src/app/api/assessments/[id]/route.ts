import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManage } from "@/lib/permissions";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    include: {
      module: { select: { id: true, name: true } },
      questions: true,
      _count: { select: { attempts: true } },
    },
  });

  if (!assessment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(assessment);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !user.role || !canManage(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, passingScore, timeLimit, moduleId } =
    await req.json();

  const assessment = await prisma.assessment.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() ?? null } : {}),
      ...(passingScore !== undefined ? { passingScore } : {}),
      ...(timeLimit !== undefined ? { timeLimit: timeLimit ?? null } : {}),
      ...(moduleId !== undefined ? { moduleId: moduleId ?? null } : {}),
    },
    include: {
      module: { select: { id: true, name: true } },
      _count: { select: { attempts: true } },
    },
  });

  return NextResponse.json(assessment);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !user.role || !canManage(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.assessment.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
