"use client";

import { useState, useRef } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Pencil, Check, X, Loader2 } from "lucide-react";
import type { LessonType } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: LessonType;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  published: boolean;
  instructor: { name: string | null; email: string };
  category: { id: string; name: string } | null;
  tags: { id: string; name: string }[];
  courseModules: Module[];
  _count: { enrollments: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LESSON_TYPE_COLORS: Record<LessonType, string> = {
  TEXT: "bg-blue-100 text-blue-700",
  VIDEO: "bg-purple-100 text-purple-700",
  QUIZ: "bg-amber-100 text-amber-700",
};

const inputClass =
  "w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400";

const btnPrimary =
  "px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60 flex items-center gap-2";

const btnGhost =
  "px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors";

const btnDanger =
  "px-3 py-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors flex items-center gap-1.5";

// ─── Inline-editable module title ─────────────────────────────────────────────

function ModuleTitleEditor({
  moduleId,
  courseId,
  initialTitle,
  onSaved,
}: {
  moduleId: string;
  courseId: string;
  initialTitle: string;
  onSaved: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function save() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === initialTitle) {
      setValue(initialTitle);
      setEditing(false);
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    setSaving(false);
    if (res.ok) {
      onSaved(trimmed);
      setEditing(false);
    }
  }

  function cancel() {
    setValue(initialTitle);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        onClick={startEdit}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-primary-600 group"
      >
        {value}
        <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") cancel();
        }}
        onBlur={save}
        className="border border-primary-400 rounded px-2 py-0.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 w-56 bg-white dark:bg-slate-800"
      />
      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
      <button onClick={save} className="text-green-600 hover:text-green-700">
        <Check className="h-3.5 w-3.5" />
      </button>
      <button onClick={cancel} className="text-slate-400 hover:text-slate-600">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Lesson edit form (inline) ─────────────────────────────────────────────────

function LessonEditForm({
  lesson,
  courseId,
  moduleId,
  onSaved,
  onCancel,
}: {
  lesson: Lesson;
  courseId: string;
  moduleId: string;
  onSaved: (updated: Lesson) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: lesson.title,
    content: lesson.content,
    type: lesson.type,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/lessons/${lesson.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      onSaved(updated);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed to save lesson");
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-2 border border-slate-200 dark:border-slate-700">
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Lesson title"
        className={inputClass}
      />
      <textarea
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        placeholder="Lesson content…"
        rows={3}
        className={inputClass + " resize-y"}
      />
      <div className="flex items-center gap-2">
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as LessonType })}
          className={inputClass + " w-32"}
        >
          <option value="TEXT">TEXT</option>
          <option value="VIDEO">VIDEO</option>
          <option value="QUIZ">QUIZ</option>
        </select>
        <button onClick={handleSave} disabled={saving} className={btnPrimary}>
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save
        </button>
        <button onClick={onCancel} className={btnGhost}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Add-lesson form ───────────────────────────────────────────────────────────

function AddLessonForm({
  courseId,
  moduleId,
  onAdded,
}: {
  courseId: string;
  moduleId: string;
  onAdded: (lesson: Lesson) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "TEXT" as LessonType });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      const lesson = await res.json();
      onAdded(lesson);
      setForm({ title: "", content: "", type: "TEXT" });
      setOpen(false);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed to add lesson");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium mt-1 px-1"
      >
        <Plus className="h-3.5 w-3.5" /> Add Lesson
      </button>
    );
  }

  return (
    <div className="mt-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-2 border border-dashed border-slate-300 dark:border-slate-600">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">New Lesson</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Lesson title *"
        className={inputClass}
      />
      <textarea
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        placeholder="Lesson content…"
        rows={3}
        className={inputClass + " resize-y"}
      />
      <div className="flex items-center gap-2">
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as LessonType })}
          className={inputClass + " w-32"}
        >
          <option value="TEXT">TEXT</option>
          <option value="VIDEO">VIDEO</option>
          <option value="QUIZ">QUIZ</option>
        </select>
        <button onClick={handleAdd} disabled={loading} className={btnPrimary}>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Add
        </button>
        <button onClick={() => { setOpen(false); setError(""); }} className={btnGhost}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Module card ───────────────────────────────────────────────────────────────

function ModuleCard({
  module,
  courseId,
  onModuleTitleSaved,
  onModuleDeleted,
  onLessonAdded,
  onLessonSaved,
  onLessonDeleted,
}: {
  module: Module;
  courseId: string;
  onModuleTitleSaved: (moduleId: string, title: string) => void;
  onModuleDeleted: (moduleId: string) => void;
  onLessonAdded: (moduleId: string, lesson: Lesson) => void;
  onLessonSaved: (moduleId: string, lesson: Lesson) => void;
  onLessonDeleted: (moduleId: string, lessonId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [deletingModuleId, setDeletingModuleId] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDeleteModule() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeletingModuleId(true);
    const res = await fetch(`/api/courses/${courseId}/modules/${module.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      onModuleDeleted(module.id);
    }
    setDeletingModuleId(false);
  }

  async function handleDeleteLesson(lessonId: string) {
    setDeletingLessonId(lessonId);
    const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
    if (res.ok) {
      onLessonDeleted(module.id, lessonId);
    }
    setDeletingLessonId(null);
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
      {/* Module header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
          {module.order + 1}
        </span>

        <div className="flex-1 min-w-0">
          <ModuleTitleEditor
            moduleId={module.id}
            courseId={courseId}
            initialTitle={module.title}
            onSaved={(title) => onModuleTitleSaved(module.id, title)}
          />
        </div>

        <span className="text-xs text-slate-400 shrink-0">
          {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}
        </span>

        {confirmDelete ? (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-red-600">Delete?</span>
            <button
              onClick={handleDeleteModule}
              disabled={deletingModuleId}
              className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
            >
              {deletingModuleId ? "..." : "Yes"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="shrink-0 text-slate-300 hover:text-red-500 transition-colors"
            title="Delete module"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Lessons list */}
      {expanded && (
        <div className="px-4 py-3 space-y-2">
          {module.lessons.length === 0 && (
            <p className="text-xs text-slate-400 py-1">No lessons yet.</p>
          )}
          {module.lessons.map((lesson) => (
            <div key={lesson.id}>
              {editingLessonId === lesson.id ? (
                <LessonEditForm
                  lesson={lesson}
                  courseId={courseId}
                  moduleId={module.id}
                  onSaved={(updated) => {
                    onLessonSaved(module.id, updated);
                    setEditingLessonId(null);
                  }}
                  onCancel={() => setEditingLessonId(null)}
                />
              ) : (
                <div className="flex items-center gap-2 group py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <span className="text-xs text-slate-400 font-mono w-5 shrink-0">
                    {lesson.order + 1}
                  </span>
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 truncate">
                    {lesson.title}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${LESSON_TYPE_COLORS[lesson.type]}`}
                  >
                    {lesson.type}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => setEditingLessonId(lesson.id)}
                      className="text-slate-400 hover:text-primary-600 transition-colors"
                      title="Edit lesson"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      disabled={deletingLessonId === lesson.id}
                      className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"
                      title="Delete lesson"
                    >
                      {deletingLessonId === lesson.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <AddLessonForm
            courseId={courseId}
            moduleId={module.id}
            onAdded={(lesson) => onLessonAdded(module.id, lesson)}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main CourseEditor ─────────────────────────────────────────────────────────

export function CourseEditor({ course: initial }: { course: CourseData }) {
  // Meta state
  const [meta, setMeta] = useState({
    title: initial.title,
    description: initial.description ?? "",
    thumbnail: initial.thumbnail ?? "",
    published: initial.published,
  });
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaMsg, setMetaMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Modules state
  const [modules, setModules] = useState<Module[]>(initial.courseModules);

  // Add module state
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [addModuleError, setAddModuleError] = useState("");

  // ── Meta save ────────────────────────────────────────────────────────────────

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault();
    if (!meta.title.trim()) return;
    setMetaSaving(true);
    setMetaMsg(null);
    const res = await fetch(`/api/courses/${initial.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: meta.title.trim(),
        description: meta.description,
        thumbnail: meta.thumbnail,
        published: meta.published,
      }),
    });
    setMetaSaving(false);
    if (res.ok) {
      setMetaMsg({ ok: true, text: "Changes saved." });
    } else {
      const d = await res.json().catch(() => ({}));
      setMetaMsg({ ok: false, text: d.error ?? "Failed to save." });
    }
  }

  // ── Module CRUD ───────────────────────────────────────────────────────────────

  async function handleAddModule(e: React.FormEvent) {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setAddingModule(true);
    setAddModuleError("");
    // Optimistic order
    const res = await fetch(`/api/courses/${initial.id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newModuleTitle.trim() }),
    });
    setAddingModule(false);
    if (res.ok) {
      const module = await res.json();
      setModules((prev) => [...prev, { ...module, lessons: [] }]);
      setNewModuleTitle("");
    } else {
      const d = await res.json().catch(() => ({}));
      setAddModuleError(d.error ?? "Failed to add module");
    }
  }

  function handleModuleTitleSaved(moduleId: string, title: string) {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, title } : m))
    );
  }

  function handleModuleDeleted(moduleId: string) {
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
  }

  function handleLessonAdded(moduleId: string, lesson: Lesson) {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m
      )
    );
  }

  function handleLessonSaved(moduleId: string, updated: Lesson) {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.map((l) => (l.id === updated.id ? updated : l)) }
          : m
      )
    );
  }

  function handleLessonDeleted(moduleId: string, lessonId: string) {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      )
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Course</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {initial._count.enrollments} enrolled &bull; by{" "}
            {initial.instructor.name ?? initial.instructor.email}
            {initial.category && (
              <span className="ml-1">in {initial.category.name}</span>
            )}
          </p>
        </div>
        <a
          href="/admin/courses"
          className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          &larr; Back to Courses
        </a>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ── Left: Course meta ── */}
        <section>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-5">
              Course Details
            </h2>
            <form onSubmit={saveMeta} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  required
                  value={meta.title}
                  onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                  className={inputClass}
                  placeholder="Course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={meta.description}
                  onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                  rows={4}
                  className={inputClass + " resize-y"}
                  placeholder="What will students learn?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={meta.thumbnail}
                  onChange={(e) => setMeta({ ...meta, thumbnail: e.target.value })}
                  className={inputClass}
                  placeholder="https://…"
                />
                {meta.thumbnail && (
                  <img
                    src={meta.thumbnail}
                    alt="Thumbnail preview"
                    className="mt-2 w-full max-h-40 object-cover rounded-lg border border-slate-200"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="published"
                  type="checkbox"
                  checked={meta.published}
                  onChange={(e) => setMeta({ ...meta, published: e.target.checked })}
                  className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                />
                <label
                  htmlFor="published"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Published
                </label>
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                    meta.published
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {meta.published ? "Published" : "Draft"}
                </span>
              </div>

              {metaMsg && (
                <p
                  className={`text-sm px-3 py-2 rounded-lg ${
                    metaMsg.ok
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {metaMsg.text}
                </p>
              )}

              <button type="submit" disabled={metaSaving} className={btnPrimary}>
                {metaSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </form>
          </div>
        </section>

        {/* ── Right: Course structure ── */}
        <section>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-5">
              Course Structure
            </h2>

            {modules.length === 0 && (
              <p className="text-sm text-slate-400 mb-4">No modules yet. Add one below.</p>
            )}

            <div className="space-y-3">
              {modules.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  module={mod}
                  courseId={initial.id}
                  onModuleTitleSaved={handleModuleTitleSaved}
                  onModuleDeleted={handleModuleDeleted}
                  onLessonAdded={handleLessonAdded}
                  onLessonSaved={handleLessonSaved}
                  onLessonDeleted={handleLessonDeleted}
                />
              ))}
            </div>

            {/* Add module form */}
            <form
              onSubmit={handleAddModule}
              className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2"
            >
              <div className="flex-1">
                <input
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="New module title…"
                  className={inputClass}
                />
                {addModuleError && (
                  <p className="text-xs text-red-600 mt-1">{addModuleError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={addingModule || !newModuleTitle.trim()}
                className={btnPrimary + " shrink-0"}
              >
                {addingModule ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Module
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
