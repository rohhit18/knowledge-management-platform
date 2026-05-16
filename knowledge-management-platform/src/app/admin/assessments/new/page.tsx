"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Module {
  id: string;
  name: string;
  project: { name: string; product: { name: string } };
}

export default function NewAssessmentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    passingScore: 70,
    timeLimit: "",
    moduleId: "",
  });
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/modules")
      .then((r) => r.json())
      .then((data: Module[]) => {
        if (Array.isArray(data)) setModules(data);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        passingScore: Number(form.passingScore),
        timeLimit: form.timeLimit ? Number(form.timeLimit) : undefined,
        moduleId: form.moduleId || undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create assessment");
      return;
    }

    const data = await res.json();
    router.push(`/admin/assessments/${data.id}`);
  }

  const inputClass =
    "w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          New Assessment
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create a new assessment, then add questions on the next page.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
            placeholder="e.g. JavaScript Fundamentals Quiz"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className={inputClass + " resize-none"}
            placeholder="What does this assessment cover?"
          />
        </div>

        {/* Passing score + Time limit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Passing Score (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.passingScore}
              onChange={(e) =>
                setForm({ ...form, passingScore: Number(e.target.value) })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              min={1}
              value={form.timeLimit}
              onChange={(e) => setForm({ ...form, timeLimit: e.target.value })}
              className={inputClass}
              placeholder="Leave blank for no limit"
            />
          </div>
        </div>

        {/* Module */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Module (optional)
          </label>
          <select
            value={form.moduleId}
            onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
            className={inputClass}
          >
            <option value="">— No module —</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.project.product.name} &rsaquo; {m.project.name} &rsaquo;{" "}
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create & Add Questions"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
