import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = { title: "Courses — Admin" };

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      instructor: { select: { name: true, email: true } },
      category: { select: { name: true } },
      _count: { select: { enrollments: true, courseModules: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Course
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Instructor</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Modules</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Students</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium max-w-xs truncate">{c.title}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c.instructor.name ?? c.instructor.email}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c._count.courseModules}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c._count.enrollments}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {c.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/courses/${c.id}`}
                      className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                    >
                      Edit
                    </Link>
                    <Link href={`/courses/${c.slug}`} className="text-gray-400 hover:text-gray-600 text-xs">
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && (
          <div className="text-center py-16 text-gray-400">No courses yet</div>
        )}
      </div>
    </div>
  );
}
