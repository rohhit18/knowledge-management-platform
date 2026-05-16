"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Search,
  Layers,
  Package,
  FolderKanban,
  Puzzle,
  FileText,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Users,
  BarChart2,
  BookMarked,
  ChevronLeft,
  Brain,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { UserRole, ROLE_LABELS } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const mainSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Search", href: "/search", icon: Search },
    ],
  },
  {
    title: "Organization",
    items: [
      { label: "Platforms", href: "/platforms", icon: Layers },
      { label: "Products", href: "/products", icon: Package },
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Modules", href: "/modules", icon: Puzzle },
    ],
  },
  {
    title: "Knowledge",
    items: [
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
    ],
  },
  {
    title: "Learning",
    items: [
      { label: "My Learning", href: "/my-learning", icon: GraduationCap },
      { label: "Courses", href: "/courses", icon: BookOpen },
      { label: "Assessments", href: "/assessments", icon: ClipboardList },
    ],
  },
];

const adminSection: NavSection = {
  title: "Administration",
  items: [
    { label: "LMS", href: "/lms", icon: BookMarked },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Analytics", href: "/admin", icon: BarChart2 },
  ],
};

const ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN"];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-not-allowed select-none",
          "text-slate-600 dark:text-slate-600"
        )}
        title="Coming soon"
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{item.label}</span>
        <span className="ml-auto text-xs font-normal px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-primary-600/20 text-primary-400"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const userName = session?.user?.name ?? session?.user?.email ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userRole = (session?.user?.role as UserRole) ?? "EMPLOYEE";
  const isAdmin = ADMIN_ROLES.includes(userRole);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0f172a] text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 font-bold text-lg text-white hover:opacity-90 transition-opacity"
          onClick={onClose}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span>KnowledgeHub</span>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {mainSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} isActive={isActive(item.href)} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Admin section — role-gated */}
        {isAdmin && (
          <div>
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              {adminSection.title}
            </p>
            <ul className="space-y-0.5">
              {adminSection.items.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} isActive={isActive(item.href)} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Bottom user panel */}
      <div className="shrink-0 border-t border-slate-800 p-3">
        {/* Settings link */}
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mb-1"
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Settings</span>
        </Link>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mb-3"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign out</span>
        </button>

        {/* User info card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/60">
          {/* Avatar */}
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-xs font-semibold shrink-0"
            aria-hidden="true"
          >
            {getInitials(userName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
          {/* Role badge */}
          <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary-600/30 text-primary-400 leading-none">
            {ROLE_LABELS[userRole] ?? userRole}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col lg:hidden",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
