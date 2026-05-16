import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/courses/CourseCard";
import Link from "next/link";

interface Props {
  searchParams: { category?: string };
}

export const metadata = { title: "Courses" };

async function getCourses(category?: string) {
  return prisma.course.findMany({
    where: {
      published: true,
      ...(category && { category: { slug: category } })
    },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true } },
      courseModules: {
        select: { id: true, lessons: { select: { id: true } } }
      },
      _count: { select: { enrollments: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { courses: { some: { published: true } } },
    orderBy: { name: "asc" }
  });
}

export default async function CoursesPage({ searchParams }: Props) {
  const [courses, categories] = await Promise.all([
    getCourses(searchParams.category),
    getCategories()
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Courses</h1>
        <p className="text-gray-500">Learn at your own pace with structured courses</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Categories</h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="/courses"
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!searchParams.category ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
              >
                All courses
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/courses?category=${cat.slug}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${searchParams.category === cat.slug ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1">
          {courses.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">No courses found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
