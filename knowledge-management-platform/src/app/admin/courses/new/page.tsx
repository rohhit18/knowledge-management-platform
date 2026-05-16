"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", thumbnail: "", tagNames: "", published: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/courses", {
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
      setError(d.error ?? "Failed to create course");
    } else {
      router.push("/admin/courses");
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">New Course</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass} placeholder="Course title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4} className={inputClass + " resize-none"}
            placeholder="What will students learn?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
          <input
            type="url" value={form.thumbnail}
            onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            className={inputClass} placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input
            type="text" value={form.tagNames}
            onChange={(e) => setForm({ ...form, tagNames: e.target.value })}
            className={inputClass} placeholder="beginner, javascript, web"
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
            {loading ? "Creating..." : "Create Course"}
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
