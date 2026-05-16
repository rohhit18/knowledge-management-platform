import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, BookOpen, GraduationCap, Users, Package, FolderKanban, FileText, LayoutTemplate, ClipboardList } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/articles", label: "Articles", icon: BookOpen },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/assessments", label: "Assessments", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/cms", label: "CMS", icon: LayoutTemplate },
];

const quickLinks = [
  { href: "/products", label: "Products", icon: Package },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/documents", label: "Documents", icon: FileText },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(role ?? "")) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
        <div className="p-4">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Admin</p>
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Platform</p>
            <nav className="space-y-1">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
