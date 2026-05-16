"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl font-semibold mb-3">Something went wrong</h2>
      <p className="text-gray-500 mb-8">{error.message}</p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
