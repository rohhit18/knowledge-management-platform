import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManage } from "@/lib/permissions";

interface Params {
  params: { id: string; questionId: string };
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !user.role || !canManage(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, type, options, answer, marks } = await req.json();

  const existing = await prisma.question.findFirst({
    where: { id: params.questionId, assessmentId: params.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const question = await prisma.question.update({
    where: { id: params.questionId },
    data: {
      ...(text !== undefined ? { text: text.trim() } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(options !== undefined ? { options } : {}),
      ...(answer !== undefined ? { answer: answer?.trim() ?? null } : {}),
      ...(marks !== undefined ? { marks } : {}),
    },
  });

  return NextResponse.json(question);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !user.role || !canManage(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.question.findFirst({
    where: { id: params.questionId, assessmentId: params.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  await prisma.question.delete({ where: { id: params.questionId } });

  return NextResponse.json({ success: true });
}
