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
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = user.role ? canManage(user.role) : false;

  const questions = await prisma.question.findMany({
    where: { assessmentId: params.id },
    select: {
      id: true,
      text: true,
      type: true,
      options: true,
      marks: true,
      assessmentId: true,
      // Only expose `answer` to admins
      ...(isAdmin ? { answer: true } : {}),
    },
  });

  return NextResponse.json(questions);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || !user.role || !canManage(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, type, options, answer, marks } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json(
      { error: "Question text is required" },
      { status: 400 }
    );
  }

  if (type !== "MCQ" && type !== "DESCRIPTIVE") {
    return NextResponse.json(
      { error: "Type must be MCQ or DESCRIPTIVE" },
      { status: 400 }
    );
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    select: { id: true },
  });

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const question = await prisma.question.create({
    data: {
      text: text.trim(),
      type,
      options: options ?? [],
      answer: answer?.trim() ?? null,
      marks: marks ?? 1,
      assessmentId: params.id,
    },
  });

  return NextResponse.json(question, { status: 201 });
}
