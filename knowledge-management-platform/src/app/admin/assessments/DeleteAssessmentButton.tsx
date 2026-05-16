"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  title: string;
}

export function DeleteAssessmentButton({ id, title }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete assessment "${title}"? This will also delete all questions and attempts.`
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/assessments/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to delete");
        setDeleting(false);
      }
    } catch {
      alert("Network error");
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium transition-colors disabled:opacity-50"
    >
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}
