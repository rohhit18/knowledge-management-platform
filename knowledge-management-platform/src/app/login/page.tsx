"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import type { Metadata } from "next";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-xl mb-4">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to KnowledgeHub</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-slate-500"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-slate-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Create one
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">Demo Credentials</p>
          <div className="space-y-1 text-xs text-slate-400 font-mono">
            <div>superadmin@example.com / super123</div>
            <div>admin@example.com / admin123</div>
            <div>employee@example.com / emp123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
