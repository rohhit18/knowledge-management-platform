"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";

const DOC_TYPES = [
  { value: "GENERAL", label: "General" },
  { value: "FUNCTIONAL", label: "Functional" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "API_DOC", label: "API Documentation" },
  { value: "UI_UX", label: "UI/UX" },
  { value: "QA", label: "QA" },
  { value: "RELEASE_NOTE", label: "Release Note" },
  { value: "TRAINING", label: "Training" },
];

export default function NewDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    type: "GENERAL",
    published: false,
    productId: searchParams.get("productId") ?? "",
    projectId: searchParams.get("projectId") ?? "",
    moduleId: searchParams.get("moduleId") ?? "",
    featureId: searchParams.get("featureId") ?? "",
    tagNames: "",
  });

  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [modules, setModules] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
    fetch("/api/projects").then((r) => r.json()).then(setProjects);
    fetch("/api/modules").then((r) => r.json()).then(setModules);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.content) {
      setError("Title and content are required");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        productId: form.productId || null,
        projectId: form.projectId || null,
        moduleId: form.moduleId || null,
        featureId: form.featureId || null,
        tagNames: form.tagNames
          ? form.tagNames.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      }),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save document");
    } else {
      const doc = await res.json();
      router.push(`/documents/${doc.id}`);
    }
  }

  const inputCls =
    "w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/documents" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Document</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputCls}
              placeholder="Document title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputCls}
              >
                {DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tagNames}
                onChange={(e) => setForm({ ...form, tagNames: e.target.value })}
                className={inputCls}
                placeholder="api, backend, v2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Excerpt</label>
            <input
              type="text"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className={inputCls}
              placeholder="Brief summary (optional)"
            />
          </div>
        </div>

        {/* Scope */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Scope</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Product</label>
              <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className={inputCls}>
                <option value="">None</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project</label>
              <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className={inputCls}>
                <option value="">None</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Module</label>
              <select value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value })} className={inputCls}>
                <option value="">None</option>
                {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Content * <span className="text-slate-400 font-normal">(HTML or plain text)</span></label>
          <textarea
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={16}
            className={inputCls + " font-mono text-xs resize-y"}
            placeholder="<h2>Overview</h2><p>Document content here...</p>"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Publish immediately</span>
          </label>

          <div className="flex gap-3">
            <Link href="/documents">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" loading={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save Document"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
