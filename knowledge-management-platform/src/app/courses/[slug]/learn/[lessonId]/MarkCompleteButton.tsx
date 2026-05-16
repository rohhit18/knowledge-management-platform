"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";

export function MarkCompleteButton({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: !completed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to update progress.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={toggle}
        disabled={loading}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
          completed
            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
            : "bg-primary-600 text-white hover:bg-primary-700"
        }`}
      >
        <CheckCircle className="h-4 w-4" />
        {loading ? "Saving..." : completed ? "Completed" : "Mark complete"}
      </button>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
