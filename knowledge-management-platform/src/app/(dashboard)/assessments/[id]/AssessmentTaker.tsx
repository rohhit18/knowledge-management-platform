"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface Question {
  id: string;
  text: string;
  type: "MCQ" | "DESCRIPTIVE";
  options: string[];
  marks: number;
}

interface Attempt {
  id: string;
  score: number | null;
  passed: boolean | null;
  answers: Record<string, string> | null;
  completedAt: string | null;
}

interface AttemptResult {
  score: number;
  passed: boolean;
  total: number;
  earned: number;
  attemptId: string;
}

interface Props {
  assessment: {
    id: string;
    title: string;
    description: string | null;
    passingScore: number;
    timeLimit: number | null;
    questions: Question[];
  };
  latestAttempt: Attempt | null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AssessmentTaker({ assessment, latestAttempt }: Props) {
  const hasCompleted = !!(latestAttempt?.completedAt);

  // View state: "results" | "taking"
  const [view, setView] = useState<"results" | "taking">(
    hasCompleted ? "results" : "taking"
  );

  // Answers map: questionId -> user answer
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<AttemptResult | null>(null);

  // Timer state (seconds remaining)
  const timeLimitSeconds = assessment.timeLimit
    ? assessment.timeLimit * 60
    : null;
  const [timeLeft, setTimeLeft] = useState<number | null>(timeLimitSeconds);

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (submitting) return;
      if (!autoSubmit && Object.keys(answers).length === 0) return;

      setSubmitting(true);
      setSubmitError("");
      try {
        const res = await fetch(`/api/assessments/${assessment.id}/attempt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        if (!res.ok) {
          const data = await res.json();
          setSubmitError(data.error ?? "Failed to submit. Please try again.");
          setSubmitting(false);
          return;
        }
        const data: AttemptResult = await res.json();
        setResult(data);
        setView("results");
      } catch {
        setSubmitError("Network error. Please try again.");
        setSubmitting(false);
      }
    },
    [answers, assessment.id, submitting]
  );

  // Countdown timer
  useEffect(() => {
    if (view !== "taking" || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [view, timeLeft, handleSubmit]);

  function handleRetake() {
    setAnswers({});
    setResult(null);
    setSubmitError("");
    setTimeLeft(timeLimitSeconds);
    setView("taking");
  }

  const displayResult = result ?? (
    latestAttempt
      ? {
          score: latestAttempt.score ?? 0,
          passed: latestAttempt.passed ?? false,
          total: assessment.questions.reduce((s, q) => s + q.marks, 0),
          earned: 0,
          attemptId: latestAttempt.id,
        }
      : null
  );

  // ── Results view ───────────────────────────────────────────────
  if (view === "results" && displayResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/assessments"
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {assessment.title}
          </h1>
        </div>

        <Card>
          <CardContent className="text-center py-10">
            {/* Score */}
            <div className="mb-4">
              <span className="text-6xl font-bold text-slate-900 dark:text-white">
                {displayResult.score}
              </span>
              <span className="text-3xl text-slate-400 dark:text-slate-500">
                /100
              </span>
            </div>

            {/* Pass / Fail badge */}
            {displayResult.passed ? (
              <div className="flex items-center justify-center gap-2 mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <Badge variant="green" className="text-base px-4 py-1">
                  Passed
                </Badge>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mb-3">
                <XCircle className="w-6 h-6 text-red-500" />
                <Badge variant="red" className="text-base px-4 py-1">
                  Failed
                </Badge>
              </div>
            )}

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              You needed {assessment.passingScore}% to pass.
            </p>

            {/* Answers summary */}
            <div className="text-left space-y-4 mb-8">
              {assessment.questions.map((q, idx) => {
                const userAnswer =
                  (result?.attemptId
                    ? answers[q.id]
                    : latestAttempt?.answers?.[q.id]) ?? null;

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                  >
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
                      Q{idx + 1}. {q.text}
                      <span className="ml-2 text-xs text-slate-400">
                        ({q.marks} mark{q.marks !== 1 ? "s" : ""})
                      </span>
                    </p>
                    {userAnswer ? (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Your answer:</span>{" "}
                        {q.type === "DESCRIPTIVE" ? (
                          <span className="italic">{userAnswer}</span>
                        ) : (
                          userAnswer
                        )}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">
                        Not answered
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <Button onClick={handleRetake} variant="primary">
              Retake Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Taking view ────────────────────────────────────────────────
  const hasAnyAnswer = Object.keys(answers).length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/assessments"
          className="mt-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {assessment.title}
          </h1>
          {assessment.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {assessment.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="green">Pass: {assessment.passingScore}%</Badge>
            <Badge variant="default">
              {assessment.questions.length} question
              {assessment.questions.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Timer */}
        {timeLeft !== null && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold ${
              timeLeft <= 60
                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {assessment.questions.map((q, idx) => (
          <Card key={q.id}>
            <CardContent>
              <div className="flex items-start gap-2 mb-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-sm font-semibold flex items-center justify-center">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {q.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={q.type === "MCQ" ? "blue" : "purple"}
                    >
                      {q.type}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {q.marks} mark{q.marks !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {q.type === "MCQ" ? (
                <div className="space-y-2 ml-9">
                  {q.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={option}
                        checked={answers[q.id] === option}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: option }))
                        }
                        className="w-4 h-4 text-primary-600 border-slate-300 dark:border-slate-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="ml-9">
                  <textarea
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Write your answer here..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error */}
      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {Object.keys(answers).length} of {assessment.questions.length} answered
        </p>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={!hasAnyAnswer || submitting}
          loading={submitting}
          variant="primary"
          size="lg"
        >
          Submit Assessment
        </Button>
      </div>
    </div>
  );
}
