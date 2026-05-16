"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface Question {
  id: string;
  text: string;
  type: "MCQ" | "DESCRIPTIVE";
  options: string[];
  answer: string | null;
  marks: number;
}

interface Module {
  id: string;
  name: string;
  projectName: string;
  productName: string;
}

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimit: number | null;
  moduleId: string | null;
  questions: Question[];
}

interface Props {
  assessment: Assessment;
  modules: Module[];
}

const MAX_OPTIONS = 6;

const inputClass =
  "w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

export function AssessmentEditor({ assessment, modules }: Props) {
  const router = useRouter();

  // ── Details state ────────────────────────────────────────────
  const [details, setDetails] = useState({
    title: assessment.title,
    description: assessment.description ?? "",
    passingScore: assessment.passingScore,
    timeLimit: assessment.timeLimit?.toString() ?? "",
    moduleId: assessment.moduleId ?? "",
  });
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsSaved, setDetailsSaved] = useState(false);

  // ── Questions state ──────────────────────────────────────────
  const [questions, setQuestions] = useState<Question[]>(assessment.questions);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Add question form ────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    text: "",
    type: "MCQ" as "MCQ" | "DESCRIPTIVE",
    options: ["", ""],
    answer: "",
    marks: 1,
  });
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [addError, setAddError] = useState("");

  // ── Save details ─────────────────────────────────────────────
  async function handleSaveDetails() {
    if (!details.title.trim()) {
      setDetailsError("Title is required");
      return;
    }
    setDetailsError("");
    setSavingDetails(true);

    const res = await fetch(`/api/assessments/${assessment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: details.title.trim(),
        description: details.description.trim() || null,
        passingScore: Number(details.passingScore),
        timeLimit: details.timeLimit ? Number(details.timeLimit) : null,
        moduleId: details.moduleId || null,
      }),
    });

    setSavingDetails(false);

    if (!res.ok) {
      const data = await res.json();
      setDetailsError(data.error ?? "Failed to save");
      return;
    }

    setDetailsSaved(true);
    setTimeout(() => setDetailsSaved(false), 2500);
    router.refresh();
  }

  // ── Delete question ──────────────────────────────────────────
  async function handleDeleteQuestion(questionId: string) {
    if (!window.confirm("Delete this question?")) return;
    setDeletingId(questionId);

    const res = await fetch(
      `/api/assessments/${assessment.id}/questions/${questionId}`,
      { method: "DELETE" }
    );

    setDeletingId(null);

    if (res.ok) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to delete question");
    }
  }

  // ── Add question option helpers ───────────────────────────────
  function addOption() {
    if (addForm.options.length >= MAX_OPTIONS) return;
    setAddForm((prev) => ({ ...prev, options: [...prev.options, ""] }));
  }

  function updateOption(index: number, value: string) {
    setAddForm((prev) => {
      const opts = [...prev.options];
      opts[index] = value;
      return { ...prev, options: opts, answer: prev.answer };
    });
  }

  function removeOption(index: number) {
    setAddForm((prev) => {
      const opts = prev.options.filter((_, i) => i !== index);
      return {
        ...prev,
        options: opts,
        answer: prev.answer === prev.options[index] ? "" : prev.answer,
      };
    });
  }

  // ── Submit new question ──────────────────────────────────────
  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.text.trim()) {
      setAddError("Question text is required");
      return;
    }
    if (addForm.type === "MCQ") {
      const filledOptions = addForm.options.filter((o) => o.trim());
      if (filledOptions.length < 2) {
        setAddError("Add at least 2 options for MCQ");
        return;
      }
      if (!addForm.answer.trim()) {
        setAddError("Select a correct answer for MCQ");
        return;
      }
    }

    setAddError("");
    setAddingQuestion(true);

    const payload: Record<string, unknown> = {
      text: addForm.text.trim(),
      type: addForm.type,
      marks: Number(addForm.marks),
    };

    if (addForm.type === "MCQ") {
      payload.options = addForm.options.filter((o) => o.trim());
      payload.answer = addForm.answer.trim();
    }

    const res = await fetch(`/api/assessments/${assessment.id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setAddingQuestion(false);

    if (!res.ok) {
      const data = await res.json();
      setAddError(data.error ?? "Failed to add question");
      return;
    }

    const newQuestion: Question = await res.json();
    setQuestions((prev) => [...prev, newQuestion]);
    // Reset form
    setAddForm({
      text: "",
      type: "MCQ",
      options: ["", ""],
      answer: "",
      marks: 1,
    });
    setShowAddForm(false);
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Back link + heading */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/assessments"
          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Edit Assessment
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {assessment.title}
          </p>
        </div>
      </div>

      {/* ── Section 1: Assessment Details ── */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Assessment Details
          </h2>
        </div>
        <CardContent className="space-y-4">
          {detailsError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg">
              {detailsError}
            </div>
          )}
          {detailsSaved && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm px-4 py-3 rounded-lg">
              Changes saved successfully.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={details.title}
              onChange={(e) =>
                setDetails({ ...details, title: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={details.description}
              onChange={(e) =>
                setDetails({ ...details, description: e.target.value })
              }
              rows={3}
              className={inputClass + " resize-none"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={details.passingScore}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    passingScore: Number(e.target.value),
                  })
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
                value={details.timeLimit}
                onChange={(e) =>
                  setDetails({ ...details, timeLimit: e.target.value })
                }
                className={inputClass}
                placeholder="No limit"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Module (optional)
            </label>
            <select
              value={details.moduleId}
              onChange={(e) =>
                setDetails({ ...details, moduleId: e.target.value })
              }
              className={inputClass}
            >
              <option value="">— No module —</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.productName} &rsaquo; {m.projectName} &rsaquo; {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveDetails}
              loading={savingDetails}
              variant="primary"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Questions ── */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Questions ({questions.length})
          </h2>
          <Button
            onClick={() => {
              setShowAddForm((v) => !v);
              setAddError("");
            }}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "Cancel" : "Add Question"}
          </Button>
        </div>

        {/* Add question form */}
        {showAddForm && (
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
              New Question
            </h3>

            {addError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddQuestion} className="space-y-4">
              {/* Question text */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Question text <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={addForm.text}
                  onChange={(e) =>
                    setAddForm({ ...addForm, text: e.target.value })
                  }
                  rows={2}
                  className={inputClass + " resize-none"}
                  placeholder="Enter your question…"
                />
              </div>

              {/* Type + Marks row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Type
                  </label>
                  <select
                    value={addForm.type}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        type: e.target.value as "MCQ" | "DESCRIPTIVE",
                        options: ["", ""],
                        answer: "",
                      })
                    }
                    className={inputClass}
                  >
                    <option value="MCQ">MCQ (Multiple Choice)</option>
                    <option value="DESCRIPTIVE">Descriptive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={addForm.marks}
                    onChange={(e) =>
                      setAddForm({ ...addForm, marks: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {/* MCQ options */}
              {addForm.type === "MCQ" && (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Options
                  </label>
                  {addForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        className={inputClass}
                        placeholder={`Option ${idx + 1}`}
                      />
                      {addForm.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {addForm.options.length < MAX_OPTIONS && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add option
                    </button>
                  )}

                  {/* Correct answer select */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Correct answer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addForm.answer}
                      onChange={(e) =>
                        setAddForm({ ...addForm, answer: e.target.value })
                      }
                      className={inputClass}
                    >
                      <option value="">— Select correct answer —</option>
                      {addForm.options
                        .filter((o) => o.trim())
                        .map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="submit"
                  loading={addingQuestion}
                  variant="primary"
                  size="sm"
                >
                  Add Question
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddError("");
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Questions list */}
        <CardContent className="p-0">
          {questions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
              No questions yet. Click &ldquo;Add Question&rdquo; to get started.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {questions.map((q, idx) => (
                <li key={q.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    {/* Index */}
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1.5">
                        {q.text}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={q.type === "MCQ" ? "blue" : "purple"}>
                          {q.type}
                        </Badge>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {q.marks} mark{q.marks !== 1 ? "s" : ""}
                        </span>
                        {q.type === "MCQ" && q.options.length > 0 && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {q.options.length} options
                          </span>
                        )}
                        {q.answer && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Answer: {q.answer}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      disabled={deletingId === q.id}
                      className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
