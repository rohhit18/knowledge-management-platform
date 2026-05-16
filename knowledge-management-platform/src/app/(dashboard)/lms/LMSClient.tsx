"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/types";
import type { UserRole } from "@/types";

interface CourseRow {
  id: string;
  title: string;
  instructorName: string;
  totalEnrollments: number;
  assignedCount: number;
  recentEnrollees: { id: string; name: string | null; email: string }[];
}

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface Props {
  courses: CourseRow[];
  users: UserRow[];
}

function roleVariant(role: string): "blue" | "purple" | "green" | "orange" | "default" {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return "blue";
  if (role === "PRODUCT_MANAGER" || role === "PROJECT_MANAGER") return "purple";
  if (role === "BACKEND_DEVELOPER" || role === "UI_UX_DESIGNER" || role === "BUSINESS_ANALYST") return "green";
  if (role === "QA_ENGINEER") return "orange";
  return "default";
}

export function LMSClient({ courses, users }: Props) {
  const [activeCourse, setActiveCourse] = useState<CourseRow | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name?.toLowerCase().includes(q) ?? false) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  function toggleUser(id: string) {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openModal(course: CourseRow) {
    setActiveCourse(course);
    setSelectedUsers(new Set());
    setDueDate("");
    setSuccessMsg("");
    setSearch("");
  }

  function closeModal() {
    setActiveCourse(null);
    setSuccessMsg("");
  }

  async function handleAssign() {
    if (!activeCourse || selectedUsers.size === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${activeCourse.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers),
          dueDate: dueDate || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Successfully assigned to ${data.assigned} user${data.assigned !== 1 ? "s" : ""}.`);
        setSelectedUsers(new Set());
      } else {
        setSuccessMsg(`Error: ${data.error}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Courses table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
              <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">Course</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 hidden md:table-cell">Instructor</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">Enrolled</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">Assigned</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{c.title}</p>
                  {c.recentEnrollees.length > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Recent: {c.recentEnrollees.slice(0, 2).map((u) => u.name ?? u.email).join(", ")}
                      {c.recentEnrollees.length > 2 && ` +${c.recentEnrollees.length - 2}`}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">{c.instructorName}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold">
                    {c.totalEnrollments}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                    {c.assignedCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openModal(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    Assign Users
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assignment Modal */}
      <Modal
        isOpen={!!activeCourse}
        onClose={closeModal}
        title={`Assign: ${activeCourse?.title}`}
        size="lg"
      >
        {successMsg ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg text-sm font-medium ${successMsg.startsWith("Error") ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"}`}>
              {successMsg}
            </div>
            <button
              onClick={closeModal}
              className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search users by name, email, or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            {/* User checklist */}
            <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.length === 0 ? (
                <p className="px-4 py-6 text-sm text-center text-slate-400">No users found.</p>
              ) : (
                filteredUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(u.id)}
                      onChange={() => toggleUser(u.id)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {u.name ?? u.email}
                      </p>
                      {u.name && (
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      )}
                    </div>
                    <Badge variant={roleVariant(u.role)}>
                      {ROLE_LABELS[u.role as UserRole] ?? u.role}
                    </Badge>
                  </label>
                ))
              )}
            </div>

            {/* Select all */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <button
                onClick={() => setSelectedUsers(new Set(filteredUsers.map((u) => u.id)))}
                className="hover:text-primary-600 transition-colors"
              >
                Select all ({filteredUsers.length})
              </button>
              {selectedUsers.size > 0 && (
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="hover:text-red-500 transition-colors"
                >
                  Clear selection
                </button>
              )}
            </div>

            {/* Due date */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Due Date <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={selectedUsers.size === 0 || submitting}
                className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Assigning…" : `Assign to ${selectedUsers.size} user${selectedUsers.size !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
