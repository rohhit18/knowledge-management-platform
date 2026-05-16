import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, BookOpen, CheckCircle, Lock } from "lucide-react";
import { EnrollButton } from "./EnrollButton";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

async function getCourse(slug: string) {
  return prisma.course.findFirst({
    where: { slug, published: true },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } },
      courseModules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } }
      },
      _count: { select: { enrollments: true } }
    }
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourse(params.slug);
  if (!course) return { title: "Not Found" };
  return { title: course.title, description: course.description ?? undefined };
}

export default async function CoursePage({ params }: Props) {
  const [course, session] = await Promise.all([
    getCourse(params.slug),
    getServerSession(authOptions)
  ]);
  if (!course) notFound();

  const userId = (session?.user as { id?: string })?.id;
  const enrollment = userId
    ? await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } })
    : null;

  const lessonCount = course.courseModules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {course.category && <Badge variant="blue">{course.category.name}</Badge>}
            {course.tags.map((tag) => <Badge key={tag.id}>{tag.name}</Badge>)}
          </div>
          <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
          {course.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
            <span>By {course.instructor.name ?? course.instructor.email}</span>
            <span>&middot;</span>
            <span>{formatDate(course.createdAt)}</span>
            <span>&middot;</span>
            <span>{course._count.enrollments} enrolled</span>
          </div>

          {/* Curriculum */}
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>
          <div className="space-y-3">
            {course.courseModules.map((mod) => (
              <div key={mod.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 font-medium text-sm flex items-center justify-between">
                  <span>{mod.title}</span>
                  <span className="text-gray-400 text-xs">{mod.lessons.length} lessons</span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.id} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                      {enrollment ? (
                        <Link
                          href={`/courses/${course.slug}/learn/${lesson.id}`}
                          className="flex items-center gap-3 hover:text-primary-600 transition-colors w-full"
                        >
                          <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
                          <span>{lesson.title}</span>
                        </Link>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 text-gray-300 shrink-0" />
                          <span className="text-gray-400">{lesson.title}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
            {course.thumbnail && (
              <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-lg mb-4" />
            )}
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Lessons</span>
                <span className="font-medium">{lessonCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Modules</span>
                <span className="font-medium">{course.courseModules.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Students</span>
                <span className="font-medium">{course._count.enrollments}</span>
              </div>
            </div>
            {enrollment ? (
              <div className="flex items-center gap-2 text-green-600 font-medium text-sm justify-center py-2.5">
                <CheckCircle className="h-5 w-5" />
                Enrolled
              </div>
            ) : (
              <EnrollButton courseId={course.id} isLoggedIn={!!session} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
