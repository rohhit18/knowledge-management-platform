"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EnrollButton({ courseId, isLoggedIn }: { courseId: string; isLoggedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enroll() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Enrollment failed. Please try again.");
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
    <div className="space-y-2">
      <button
        onClick={enroll}
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Enrolling..." : "Enroll for free"}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
      )}
    </div>
  );
}
