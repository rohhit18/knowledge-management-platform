"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

// ── Types ────────────────────────────────────────────────────────────────────

interface EnrollmentRow {
  id: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  courseDescription: string | null;
  instructorName: string;
  totalLessons: number;
  completedLessons: number;
  assignedBy: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

type FilterTab = "All" | "In Progress" | "Completed" | "Not Started";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStatus(row: EnrollmentRow): "completed" | "in-progress" | "not-started" {
  if (row.completedAt || (row.totalLessons > 0 && row.completedLessons === row.totalLessons)) {
    return "completed";
  }
  if (row.completedLessons > 0) return "in-progress";
  return "not-started";
}

function dueDateVariant(
  dueDate: string
): { label: string; className: string } {
  const due = new Date(dueDate);
  const now = new Date();
  const msInDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((due.getTime() - now.getTime()) / msInDay);

  const formatted = due.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (daysLeft < 0) {
    return {
      label: `Due: ${formatted}`,
      className: "text-red-600 dark:text-red-400",
    };
  }
  if (daysLeft <= 7) {
    return {
      label: `Due: ${formatted}`,
      className: "text-yellow-600 dark:text-yellow-400",
    };
  }
  return {
    label: `Due: ${formatted}`,
    className: "text-slate-500 dark:text-slate-400",
  };
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/5" />
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
      </div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/5 mb-4" />
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-full mb-2" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-5" />
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
    </div>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────

function CourseCard({ row }: { row: EnrollmentRow }) {
  const status = getStatus(row);
  const pct =
    row.totalLessons > 0
      ? Math.round((row.completedLessons / row.totalLessons) * 100)
      : 0;

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-col gap-3 flex-1 py-5">
        {/* Title + source pills */}
        <div className="flex items-start gap-2">
          <Link
            href={`/courses/${row.courseSlug}`}
            className="flex-1 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 leading-snug line-clamp-2 transition-colors"
          >
            {row.courseTitle}
          </Link>
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              row.assignedBy
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
            }`}
          >
            {row.assignedBy ? "Assigned" : "Enrolled"}
          </span>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{row.instructorName}</span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all ${
                status === "completed"
                  ? "bg-green-500"
                  : status === "in-progress"
                  ? "bg-blue-500"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {row.completedLessons} of {row.totalLessons} lesson
            {row.totalLessons !== 1 ? "s" : ""} completed
          </p>
        </div>

        {/* Status badge + due date */}
        <div className="flex flex-wrap items-center gap-2">
          {status === "completed" && (
            <Badge variant="green">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
          {status === "in-progress" && (
            <Badge variant="blue">
              <BookOpen className="w-3 h-3 mr-1" />
              In Progress
            </Badge>
          )}
          {status === "not-started" && (
            <Badge variant="default">
              <Clock className="w-3 h-3 mr-1" />
              Not Started
            </Badge>
          )}

          {row.dueDate && (() => {
            const { label, className } = dueDateVariant(row.dueDate);
            return (
              <span className={`flex items-center gap-1 text-xs font-medium ${className}`}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {label}
              </span>
            );
          })()}
        </div>

        {/* If assigned, show assigner */}
        {row.assignedBy && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Assigned by {row.assignedBy}
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-1">
          <Link href={`/courses/${row.courseSlug}`} className="block">
            <Button variant="secondary" size="sm" className="w-full">
              Continue Learning
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS: FilterTab[] = ["All", "In Progress", "Completed", "Not Started"];

export default function MyLearningPage() {
  useSession(); // ensures session context is available (renders inside SessionProvider)

  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  useEffect(() => {
    fetch("/api/my-learning")
      .then((r) => r.json())
      .then((data: { enrollments: EnrollmentRow[] }) => {
        setEnrollments(data.enrollments ?? []);
      })
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter((row) => {
    if (activeTab === "All") return true;
    const s = getStatus(row);
    if (activeTab === "Completed") return s === "completed";
    if (activeTab === "In Progress") return s === "in-progress";
    if (activeTab === "Not Started") return s === "not-started";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          My Learning
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Courses assigned to you or enrolled by you
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700">
        {TABS.map((tab) => {
          const count =
            tab === "All"
              ? enrollments.length
              : enrollments.filter((r) => {
                  const s = getStatus(r);
                  if (tab === "Completed") return s === "completed";
                  if (tab === "In Progress") return s === "in-progress";
                  if (tab === "Not Started") return s === "not-started";
                  return false;
                }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
                ${
                  activeTab === tab
                    ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }
              `}
            >
              {tab}
              {!loading && (
                <span
                  className={`ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<GraduationCap />}
          title="No courses yet"
          description="Courses assigned to you will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((row) => (
            <CourseCard key={row.id} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}
