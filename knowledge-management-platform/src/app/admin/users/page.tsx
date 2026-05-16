import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROLE_LABELS } from "@/types";

export const metadata = { title: "Users — Admin" };

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
  ADMIN: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400",
  PRODUCT_MANAGER: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
  PROJECT_MANAGER: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  BUSINESS_ANALYST: "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400",
  BACKEND_DEVELOPER: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
  UI_UX_DESIGNER: "bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-400",
  QA_ENGINEER: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  EMPLOYEE: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
};

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!["SUPER_ADMIN", "ADMIN"].includes(session?.user?.role ?? "")) redirect("/admin");

  const users = await prisma.user.findMany({
    include: {
      _count: { select: { enrollments: true, documents: true, articles: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
        <p className="text-sm text-slate-500">{users.length} total</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Name / Email</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Docs</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Enrollments</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 dark:text-white">{u.name ?? "—"}</p>
                  <p className="text-slate-400 text-xs">{u.email}</p>
                  {u.designation && <p className="text-slate-400 text-xs">{u.designation}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role] ?? ROLE_COLORS.EMPLOYEE}`}>
                    {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{u._count.documents}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{u._count.enrollments}</td>
                <td className="px-4 py-3 text-slate-400 hidden lg:table-cell text-xs">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-16 text-slate-400">No users yet</div>
        )}
      </div>
    </div>
  );
}
