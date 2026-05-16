import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AssessmentTaker } from "./AssessmentTaker";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  return { title: assessment?.title ?? "Assessment" };
}

export default async function AssessmentPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = session.user as { id?: string; role?: string };
  if (!user.id) redirect("/login");

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        select: {
          id: true,
          text: true,
          type: true,
          options: true,
          marks: true,
        },
      },
      module: { select: { id: true, name: true } },
      _count: { select: { attempts: true } },
    },
  });

  if (!assessment) notFound();

  const latestAttempt = await prisma.assessmentAttempt.findFirst({
    where: { assessmentId: params.id, userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Serialize for client component
  const serializedAttempt = latestAttempt
    ? {
        id: latestAttempt.id,
        score: latestAttempt.score,
        passed: latestAttempt.passed,
        answers: (latestAttempt.answers as Record<string, string> | null) ?? null,
        completedAt: latestAttempt.completedAt?.toISOString() ?? null,
      }
    : null;

  const serializedAssessment = {
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    passingScore: assessment.passingScore,
    timeLimit: assessment.timeLimit,
    questions: assessment.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type as "MCQ" | "DESCRIPTIVE",
      options: q.options,
      marks: q.marks,
    })),
  };

  return (
    <AssessmentTaker
      assessment={serializedAssessment}
      latestAttempt={serializedAttempt}
    />
  );
}
