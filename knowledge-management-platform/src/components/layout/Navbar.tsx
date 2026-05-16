"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, Search, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/courses", label: "Courses", icon: GraduationCap },
  { href: "/search", label: "Search", icon: Search },
];

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "PROJECT_MANAGER"];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role ?? "";

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center gap-6">
        <Link href="/" className="font-bold text-xl text-primary-700 dark:text-primary-400 shrink-0">
          KnowledgeHub
        </Link>

        <div className="flex items-center gap-1 flex-1">
          {session && (
            <Link
              href="/dashboard"
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith("/dashboard")
                  ? "bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              Dashboard
            </Link>
          )}
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {label}
            </Link>
          ))}
          {ADMIN_ROLES.includes(role) && (
            <Link
              href="/admin"
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {session ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                {session.user?.name ?? session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
