import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { MarkCompleteButton } from "./MarkCompleteButton";

interface Props { params: { slug: string; lessonId: string } }

export default async function LessonPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/login");

  const course = await prisma.course.findFirst({
    where: { slug: params.slug },
    include: {
      courseModules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } }
      }
    }
  });
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } }
  });
  if (!enrollment) redirect(`/courses/${params.slug}`);

  const allLessons = course.courseModules.flatMap((m) => m.lessons);
  const currentIdx = allLessons.findIndex((l) => l.id === params.lessonId);
  if (currentIdx === -1) notFound();

  const lesson = await prisma.lesson.findUnique({ where: { id: params.lessonId } });
  if (!lesson) notFound();

  const progress = await prisma.progress.findUnique({
    where: { userId_lessonId: { userId, lessonId: lesson.id } }
  });

  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href={`/courses/${params.slug}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              Lesson {currentIdx + 1} of {allLessons.length}
            </p>
            <h1 className="text-xl font-semibold">{lesson.title}</h1>
          </div>
          {progress?.completed && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <CheckCircle className="h-5 w-5" /> Completed
            </span>
          )}
        </div>

        <div className="px-8 py-8">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>

        <div className="border-t border-gray-200 px-8 py-5 flex items-center justify-between">
          {prevLesson ? (
            <Link
              href={`/courses/${params.slug}/learn/${prevLesson.id}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Link>
          ) : <div />}

          <MarkCompleteButton lessonId={lesson.id} completed={progress?.completed ?? false} />

          {nextLesson ? (
            <Link
              href={`/courses/${params.slug}/learn/${nextLesson.id}`}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href={`/courses/${params.slug}`}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Finish course <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
