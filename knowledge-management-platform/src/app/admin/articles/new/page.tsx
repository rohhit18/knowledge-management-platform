"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", tagNames: "", published: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tagNames: form.tagNames.split(",").map((t) => t.trim()).filter(Boolean)
      })
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to create article");
    } else {
      router.push("/admin/articles");
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">New Article</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass} placeholder="Article title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
          <input
            type="text" value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className={inputClass} placeholder="Short summary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content * (HTML supported)</label>
          <textarea
            required value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={12}
            className={inputClass + " resize-none font-mono text-xs"}
            placeholder="<p>Write your article content here...</p>"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input
            type="text" value={form.tagNames}
            onChange={(e) => setForm({ ...form, tagNames: e.target.value })}
            className={inputClass} placeholder="react, nextjs, tutorial"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            id="published" type="checkbox" checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">Publish immediately</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={loading}
            className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Article"}
          </button>
          <button
            type="button" onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
