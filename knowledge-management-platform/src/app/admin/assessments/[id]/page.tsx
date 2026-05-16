import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AssessmentEditor } from "./AssessmentEditor";

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
  return { title: assessment ? `Edit: ${assessment.title}` : "Edit Assessment" };
}

export default async function AdminAssessmentEditPage({ params }: PageProps) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        orderBy: { id: "asc" },
      },
      module: { select: { id: true, name: true } },
    },
  });

  if (!assessment) notFound();

  const modules = await prisma.module.findMany({
    select: {
      id: true,
      name: true,
      project: {
        select: {
          name: true,
          product: { select: { name: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const serialized = {
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    passingScore: assessment.passingScore,
    timeLimit: assessment.timeLimit,
    moduleId: assessment.moduleId,
    questions: assessment.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type as "MCQ" | "DESCRIPTIVE",
      options: q.options,
      answer: q.answer,
      marks: q.marks,
    })),
  };

  const serializedModules = modules.map((m) => ({
    id: m.id,
    name: m.name,
    projectName: m.project.name,
    productName: m.project.product.name,
  }));

  return (
    <AssessmentEditor assessment={serialized} modules={serializedModules} />
  );
}
