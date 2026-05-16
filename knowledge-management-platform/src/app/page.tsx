import Link from "next/link";
import {
  BookOpen, GraduationCap, Search, Users, Package, FolderKanban,
  Puzzle, FileText, ArrowRight, Shield, Layers, Zap
} from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [products, projects, modules, documents, courses, users] = await Promise.all([
    prisma.product.count(),
    prisma.project.count(),
    prisma.module.count(),
    prisma.document.count({ where: { published: true } }),
    prisma.course.count({ where: { published: true } }),
    prisma.user.count(),
  ]);
  return { products, projects, modules, documents, courses, users };
}

export default async function HomePage() {
  const stats = await getStats();

  const features = [
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Product Hierarchy",
      desc: "Navigate from Platform → Products → Projects → Modules → Features in a structured hierarchy.",
      color: "bg-blue-500",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Documentation Hub",
      desc: "Centralized repository for functional, technical, API, QA, and release documentation.",
      color: "bg-purple-500",
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Training & LMS",
      desc: "Structured courses with modules, lessons, progress tracking, and role-based assignments.",
      color: "bg-green-500",
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Global Search",
      desc: "Find anything across products, modules, documents, articles, and courses instantly.",
      color: "bg-orange-500",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Role-Based Access",
      desc: "9 distinct roles — Super Admin to Employee — each with tailored access controls.",
      color: "bg-red-500",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Assessments",
      desc: "Module-linked assessments with MCQ, scoring, pass/fail, and result tracking.",
      color: "bg-yellow-500",
    },
  ];

  const statsData = [
    { label: "Products", value: stats.products, icon: Package },
    { label: "Projects", value: stats.projects, icon: FolderKanban },
    { label: "Modules", value: stats.modules, icon: Puzzle },
    { label: "Documents", value: stats.documents, icon: FileText },
    { label: "Courses", value: stats.courses, icon: BookOpen },
    { label: "Users", value: stats.users, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">KnowledgeHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/knowledge-base" className="text-sm text-slate-400 hover:text-white transition-colors">
              Knowledge Base
            </Link>
            <Link href="/courses" className="text-sm text-slate-400 hover:text-white transition-colors">
              Courses
            </Link>
            <Link
              href="/login"
              className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-950 border border-primary-800 text-primary-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <Zap className="w-3 h-3" /> Enterprise Knowledge Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Centralize your
            <span className="text-primary-400"> product knowledge</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            One platform for product documentation, project knowledge, training materials,
            and assessments. Eliminate KT dependency and reduce onboarding time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
          {statsData.map(({ label, value, icon: Icon }) => (
            <div key={label}>
              <Icon className="w-5 h-5 text-primary-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-slate-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything your team needs</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From platform hierarchy management to assessments — built for engineering teams at scale.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
              >
                <div className={`w-10 h-10 ${f.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center border-t border-slate-800">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to centralize your knowledge?</h2>
          <p className="text-slate-400 mb-8">Sign in to access your organization&apos;s complete knowledge base.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 px-6 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} KnowledgeHub. All rights reserved.
      </footer>
    </div>
  );
}
