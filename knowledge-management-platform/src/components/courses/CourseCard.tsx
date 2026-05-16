import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { BookOpen, Users } from "lucide-react";

interface CourseCardProps {
  course: {
    slug: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    createdAt: Date;
    instructor: { name: string | null; email: string };
    category: { name: string; slug: string } | null;
    tags: { id: string; name: string }[];
    courseModules: { lessons: unknown[] }[];
    _count?: { enrollments: number };
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const lessonCount = course.courseModules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {course.thumbnail ? (
        <img src={course.thumbnail} alt={course.title} className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-primary-400" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {course.category && <Badge variant="blue">{course.category.name}</Badge>}
          {course.tags.slice(0, 2).map((tag) => (
            <Badge key={tag.id}>{tag.name}</Badge>
          ))}
        </div>
        <h2 className="text-lg font-semibold mb-2 leading-snug">
          <Link href={`/courses/${course.slug}`} className="hover:text-primary-600 transition-colors">
            {course.title}
          </Link>
        </h2>
        {course.description && (
          <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{course.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {lessonCount} lessons
          </span>
          {course._count && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course._count.enrollments} enrolled
            </span>
          )}
          <span>{course.instructor.name ?? course.instructor.email}</span>
        </div>
      </div>
    </div>
  );
}
