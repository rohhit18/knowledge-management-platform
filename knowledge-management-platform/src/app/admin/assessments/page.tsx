import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { DeleteAssessmentButton } from "./DeleteAssessmentButton";

export const metadata: Metadata = { title: "Assessments — Admin" };

export default async function AdminAssessmentsPage() {
  const assessments = await prisma.assessment.findMany({
    include: {
      module: { select: { id: true, name: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Assessments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage assessments and questions
          </p>
        </div>
        <Link
          href="/admin/assessments/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Assessment
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                Title
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hidden md:table-cell">
                Module
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                Questions
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                Attempts
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hidden lg:table-cell">
                Pass Score
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hidden lg:table-cell">
                Time Limit
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
            {assessments.map((a) => (
              <tr
                key={a.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                  {a.title}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                  {a.module ? (
                    <Badge variant="indigo">{a.module.name}</Badge>
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                  {a._count.questions}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                  {a._count.attempts}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <Badge variant="green">{a.passingScore}%</Badge>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                  {a.timeLimit ? `${a.timeLimit} min` : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/assessments/${a.id}`}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-xs font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteAssessmentButton id={a.id} title={a.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {assessments.length === 0 && (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            No assessments yet.{" "}
            <Link
              href="/admin/assessments/new"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Create the first one.
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
