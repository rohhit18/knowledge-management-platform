import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CourseEditor } from "./CourseEditor";

export const metadata = { title: "Edit Course — Admin" };

export default async function AdminCourseEditPage({
  params,
}: {
  params: { id: string };
}) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      instructor: { select: { name: true, email: true } },
      category: { select: { id: true, name: true } },
      tags: { select: { id: true, name: true } },
      courseModules: {
        include: { lessons: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

  return <CourseEditor course={course} />;
}
