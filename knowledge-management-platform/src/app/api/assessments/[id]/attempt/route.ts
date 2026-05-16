import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { answers } = await req.json() as {
    answers: Record<string, string>;
  };

  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "answers is required" }, { status: 400 });
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        select: { id: true, type: true, answer: true, marks: true },
      },
    },
  });

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  // Calculate score
  let earnedMarks = 0;
  let totalMarks = 0;

  for (const question of assessment.questions) {
    totalMarks += question.marks;

    if (question.type === "MCQ" && question.answer) {
      const userAnswer = answers[question.id];
      if (
        userAnswer !== undefined &&
        userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()
      ) {
        earnedMarks += question.marks;
      }
    }
    // DESCRIPTIVE questions are not auto-scored
  }

  const score =
    totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
  const passed = score >= assessment.passingScore;

  const attempt = await prisma.assessmentAttempt.create({
    data: {
      userId: user.id,
      assessmentId: params.id,
      score,
      passed,
      answers,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({
    score,
    passed,
    total: totalMarks,
    earned: earnedMarks,
    attemptId: attempt.id,
  });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attempts = await prisma.assessmentAttempt.findMany({
    where: { assessmentId: params.id, userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(attempts);
}
