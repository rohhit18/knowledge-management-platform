import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MANAGER_ROLES } from "@/types";
import type { UserRole } from "@/types";
import { StatsCard } from "@/components/ui/StatsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LMSClient } from "./LMSClient";
import { BookMarked, Users, UserCheck, BookOpen } from "lucide-react";

export const metadata: Metadata = { title: "LMS Management" };

export default async function LMSPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";
  if (!MANAGER_ROLES.includes(role as UserRole)) redirect("/dashboard");

  const [courses, users, totalEnrollments, assignedEnrollments] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      include: {
        instructor: { select: { name: true, email: true } },
        _count: { select: { enrollments: true } },
        enrollments: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { title: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ name: "asc" }, { email: "asc" }],
    }),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { assignedBy: { not: null } } }),
  ]);

  const courseRows = courses.map((c) => ({
    id: c.id,
    title: c.title,
    instructorName: c.instructor.name ?? c.instructor.email,
    totalEnrollments: c._count.enrollments,
    assignedCount: c.enrollments.filter((e) => e.assignedBy !== null).length,
    recentEnrollees: c.enrollments.map((e) => ({
      id: e.user.id,
      name: e.user.name,
      email: e.user.email,
    })),
  }));

  const userRows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as string,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          LMS Management
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Assign courses to team members and track learning progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Published Courses"
          value={courses.length}
          icon={<BookMarked />}
          color="purple"
        />
        <StatsCard
          title="Total Users"
          value={users.length}
          icon={<Users />}
          color="blue"
        />
        <StatsCard
          title="Total Enrollments"
          value={totalEnrollments}
          icon={<BookOpen />}
          color="green"
        />
        <StatsCard
          title="Admin Assigned"
          value={assignedEnrollments}
          icon={<UserCheck />}
          color="orange"
        />
      </div>

      {/* Courses table or empty state */}
      {courses.length === 0 ? (
        <EmptyState
          icon={<BookMarked />}
          title="No published courses"
          description="Publish courses first to start assigning them to users."
        />
      ) : (
        <LMSClient courses={courseRows} users={userRows} />
      )}
    </div>
  );
}
