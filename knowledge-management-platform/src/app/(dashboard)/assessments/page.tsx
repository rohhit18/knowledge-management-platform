import { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Clock, BookOpen, CheckCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "Assessments" };

export default async function AssessmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const assessments = await prisma.assessment.findMany({
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Assessments
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Test your knowledge
        </p>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {assessments.length} assessment{assessments.length !== 1 ? "s" : ""} available
      </p>

      {assessments.length === 0 ? (
        <EmptyState
          icon={<ClipboardList />}
          title="No assessments yet"
          description="Assessments will appear here once they are created by an administrator."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {assessments.map((assessment) => (
            <Card
              key={assessment.id}
              className="flex flex-col hover:shadow-md transition-shadow"
            >
              <CardContent className="flex flex-col h-full">
                {/* Icon + badges row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex-shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <Badge variant="green">Pass: {assessment.passingScore}%</Badge>
                    {assessment.timeLimit && (
                      <Badge variant="yellow">
                        {assessment.timeLimit} min
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  <Link
                    href={`/assessments/${assessment.id}`}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {assessment.title}
                  </Link>
                </h3>

                {/* Module breadcrumb */}
                {assessment.module && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {assessment.module.project.product.name} &rsaquo;{" "}
                    {assessment.module.project.name} &rsaquo;{" "}
                    {assessment.module.name}
                  </p>
                )}

                {/* Description */}
                {assessment.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 flex-1">
                    {truncate(assessment.description, 100)}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {assessment._count.questions} question
                    {assessment._count.questions !== 1 ? "s" : ""}
                  </span>
                  {assessment.timeLimit && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {assessment.timeLimit} min
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {assessment._count.attempts} attempt
                    {assessment._count.attempts !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href={`/assessments/${assessment.id}`}
                  className="block w-full text-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Take Assessment
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
