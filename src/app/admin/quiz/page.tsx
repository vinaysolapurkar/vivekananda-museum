"use client";

import { useState, useEffect } from "react";

interface Quiz {
  id: number;
  title: string;
  time_limit_minutes: number;
  passing_score: number;
  is_active: number;
}

interface Question {
  id: number;
  quiz_id: number;
  question_type: string;
  question_en: string;
  question_kn: string;
  question_hi: string;
  options: string[];
  correct_answer: number;
  difficulty: string;
  image_url: string;
  grid_size: number;
}

const btnPrimary: React.CSSProperties = { minHeight: 40, fontSize: "0.85rem", padding: "0 1.1rem" };
const btnSmall: React.CSSProperties = { minHeight: 30, fontSize: "0.75rem", padding: "0 0.7rem" };

export default function AdminQuiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Record<number, Question[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingQuiz, setEditingQuiz] = useState<Partial<Quiz> | null>(null);
  const [editingQ, setEditingQ] = useState<{
    id?: number;
    quiz_id: number;
    question_type: "mcq" | "puzzle";
    question_en: string;
    question_kn: string;
    question_hi: string;
    options: string[];
    correct_answer: number;
    difficulty: string;
    image_url: string;
    grid_size: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);

  const fetchQuizzes = () => {
    setLoading(true);
    fetch("/api/quiz")
      .then((r) => r.json())
      .then((d) => setQuizzes(d.quizzes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchQuestions = (quizId: number) => {
    fetch(`/api/quiz/${quizId}/questions?lang=en&admin=true`)
      .then((r) => r.json())
      .then((d) => setQuestions((prev) => ({ ...prev, [quizId]: d.questions || [] })));
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const toggleExpand = (id: number) => {
    if (expandedQuiz === id) {
      setExpandedQuiz(null);
    } else {
      setExpandedQuiz(id);
      if (!questions[id]) fetchQuestions(id);
    }
  };

  const readError = async (res: Response) => {
    try {
      const d = await res.json();
      return d.error || `Request failed (${res.status})`;
    } catch {
      return `Request failed (${res.status})`;
    }
  };

  const saveQuiz = async () => {
    if (!editingQuiz) return;
    if (!editingQuiz.title?.trim()) {
      setMsg("Error: quiz title is required");
      return;
    }
    setSaving(true);
    try {
      const isEdit = editingQuiz.id !== undefined;
      const res = await fetch(isEdit ? `/api/quiz/${editingQuiz.id}` : "/api/quiz", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingQuiz),
      });
      if (res.ok) {
        setEditingQuiz(null);
        setMsg("Quiz saved!");
        fetchQuizzes();
      } else {
        setMsg(`Error saving quiz: ${await readError(res)}`);
      }
    } catch {
      setMsg("Error saving quiz");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = async (quiz: Quiz) => {
    if (!confirm(`Delete quiz "${quiz.title}" and all its questions? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/quiz/${quiz.id}`, { method: "DELETE" });
      if (res.ok) {
        setMsg("Quiz deleted");
        if (expandedQuiz === quiz.id) setExpandedQuiz(null);
        fetchQuizzes();
      } else {
        setMsg(`Error deleting quiz: ${await readError(res)}`);
      }
    } catch {
      setMsg("Error deleting quiz");
    } finally {
      setSaving(false);
    }
  };

  const saveQuestion = async () => {
    if (!editingQ) return;
    if (editingQ.question_type === "puzzle") {
      if (!editingQ.image_url.trim()) {
        setMsg("Error: puzzle image URL is required");
        return;
      }
      if (![3, 4].includes(editingQ.grid_size)) {
        setMsg("Error: grid size must be 3 or 4");
        return;
      }
    } else {
      if (!editingQ.question_en.trim()) {
        setMsg("Error: question text (English) is required");
        return;
      }
      if (editingQ.options.some((o) => !o.trim())) {
        setMsg("Error: all four options are required");
        return;
      }
    }
    setSaving(true);
    try {
      const isEdit = editingQ.id !== undefined;
      const res = await fetch("/api/quiz/questions", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isEdit ? { id: editingQ.id } : {}),
          quiz_id: editingQ.quiz_id,
          question_type: editingQ.question_type,
          question_en: editingQ.question_en,
          question_kn: editingQ.question_kn,
          question_hi: editingQ.question_hi,
          options_en: editingQ.options,
          correct_answer: editingQ.correct_answer,
          difficulty: editingQ.difficulty,
          image_url: editingQ.image_url,
          grid_size: editingQ.grid_size,
        }),
      });
      if (res.ok) {
        setEditingQ(null);
        setMsg("Question saved!");
        fetchQuestions(editingQ.quiz_id);
      } else {
        setMsg(`Error saving question: ${await readError(res)}`);
      }
    } catch {
      setMsg("Error saving question");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (ques: Question) => {
    if (!confirm("Delete this question?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/quiz/questions?id=${ques.id}`, { method: "DELETE" });
      if (res.ok) {
        setMsg("Question deleted");
        fetchQuestions(ques.quiz_id);
      } else {
        setMsg(`Error deleting question: ${await readError(res)}`);
      }
    } catch {
      setMsg("Error deleting question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="m-eyebrow mb-1">Knowledge Quiz</p>
          <h1 className="text-3xl" style={{ color: "var(--ivory)" }}>Quizzes</h1>
        </div>
        <button
          onClick={() =>
            setEditingQuiz({ title: "", time_limit_minutes: 10, passing_score: 50, is_active: 1 })
          }
          className="m-btn m-btn-primary"
          style={btnPrimary}
        >
          + Add Quiz
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 rounded-lg text-sm font-medium" style={/fail|error/i.test(msg) ? { background: "rgba(155, 61, 52, 0.15)", border: "1px solid rgba(155, 61, 52, 0.4)", color: "#E08A7E" } : { background: "rgba(212, 163, 79, 0.1)", border: "1px solid var(--hairline)", color: "var(--gold)" }}>{msg}</div>
      )}

      {/* Quiz Form (create / edit) */}
      {editingQuiz && (
        <div className="m-card p-6 mb-6">
          <h2 className="text-xl mb-4" style={{ color: "var(--ivory)" }}>
            {editingQuiz.id !== undefined ? "Edit Quiz" : "New Quiz"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Quiz title"
              value={editingQuiz.title || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
              className="px-3 py-2 text-sm md:col-span-3"
            />
            <input
              type="number"
              placeholder="Time limit (minutes)"
              value={editingQuiz.time_limit_minutes || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, time_limit_minutes: parseInt(e.target.value) || 10 })}
              className="px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Passing score (%)"
              value={editingQuiz.passing_score || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, passing_score: parseInt(e.target.value) || 50 })}
              className="px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--ink-muted)" }}>
              <input
                type="checkbox"
                checked={editingQuiz.is_active !== 0}
                onChange={(e) => setEditingQuiz({ ...editingQuiz, is_active: e.target.checked ? 1 : 0 })}
              />
              Active (visible to visitors)
            </label>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveQuiz} disabled={saving} className="m-btn m-btn-primary disabled:opacity-50" style={btnPrimary}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditingQuiz(null)} className="m-btn m-btn-ghost" style={btnPrimary}>Cancel</button>
          </div>
        </div>
      )}

      {/* Question Form (create / edit) */}
      {editingQ && (
        <div className="m-card p-6 mb-6">
          <h2 className="text-xl mb-4" style={{ color: "var(--ivory)" }}>
            {editingQ.id !== undefined ? "Edit Question" : "New Question"}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              {(["mcq", "puzzle"] as const).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setEditingQ({ ...editingQ, question_type: tp })}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: editingQ.question_type === tp ? "var(--gold)" : "var(--bg-raised)",
                    color: editingQ.question_type === tp ? "#241305" : "var(--ink-muted)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  {tp === "mcq" ? "Multiple choice" : "Jigsaw puzzle"}
                </button>
              ))}
            </div>

            {editingQ.question_type === "puzzle" ? (
              <>
                <input
                  placeholder="Puzzle image URL (e.g. /uploads/quiz/temple.jpg)"
                  value={editingQ.image_url}
                  onChange={(e) => setEditingQ({ ...editingQ, image_url: e.target.value })}
                  className="w-full px-3 py-2 text-sm"
                />
                <select
                  value={editingQ.grid_size}
                  onChange={(e) => setEditingQ({ ...editingQ, grid_size: parseInt(e.target.value) })}
                  className="px-3 py-2 text-sm"
                >
                  <option value={3}>3 × 3 (easier)</option>
                  <option value={4}>4 × 4 (harder)</option>
                </select>
                <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                  Visitors tap two tiles to swap them and rebuild this image. Assigned by grid size — the quiz uses one 3×3 puzzle at question 5 and one 4×4 puzzle at question 10.
                </p>
              </>
            ) : (
              <>
                <input
                  placeholder="Question (English)"
                  value={editingQ.question_en}
                  onChange={(e) => setEditingQ({ ...editingQ, question_en: e.target.value })}
                  className="w-full px-3 py-2 text-sm"
                />
                <input
                  placeholder="Question (Kannada)"
                  value={editingQ.question_kn}
                  onChange={(e) => setEditingQ({ ...editingQ, question_kn: e.target.value })}
                  className="w-full px-3 py-2 text-sm"
                />
                <input
                  placeholder="Question (Hindi)"
                  value={editingQ.question_hi}
                  onChange={(e) => setEditingQ({ ...editingQ, question_hi: e.target.value })}
                  className="w-full px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {editingQ.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct"
                        checked={editingQ.correct_answer === i}
                        onChange={() => setEditingQ({ ...editingQ, correct_answer: i })}
                      />
                      <input
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={(e) => {
                          const opts = [...editingQ.options];
                          opts[i] = e.target.value;
                          setEditingQ({ ...editingQ, options: opts });
                        }}
                        className="flex-1 px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
                <select
                  value={editingQ.difficulty}
                  onChange={(e) => setEditingQ({ ...editingQ, difficulty: e.target.value })}
                  className="px-3 py-2 text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                  The quiz runs 2 easy → 3 medium → 3 hard questions in a randomized order within each tier, so difficulty rises steadily.
                </p>
              </>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveQuestion} disabled={saving} className="m-btn m-btn-primary disabled:opacity-50" style={btnPrimary}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditingQ(null)} className="m-btn m-btn-ghost" style={btnPrimary}>Cancel</button>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "var(--saffron)", borderTopColor: "transparent" }} />
        </div>
      ) : quizzes.length === 0 ? (
        <p className="text-center py-10" style={{ color: "var(--ink-muted)" }}>No quizzes yet.</p>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <div key={q.id} className="m-card overflow-hidden">
              <div
                onClick={() => toggleExpand(q.id)}
                className="w-full p-4 flex items-center justify-between transition-colors hover:bg-white/5 cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-left" style={{ color: "var(--ivory)" }}>
                    {q.title}
                    {Number(q.is_active) === 0 && (
                      <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium align-middle" style={{ background: "rgba(155, 61, 52, 0.15)", color: "#E08A7E" }}>
                        Inactive
                      </span>
                    )}
                  </p>
                  <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                    {q.time_limit_minutes} min · Pass: {q.passing_score}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingQ(null);
                      setEditingQuiz({ ...q });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="m-btn m-btn-ghost"
                    style={btnSmall}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteQuiz(q); }}
                    className="m-btn m-btn-ghost"
                    style={{ ...btnSmall, color: "#E08A7E" }}
                  >
                    Delete
                  </button>
                  <span style={{ color: "var(--ink-faint)" }}>{expandedQuiz === q.id ? "▼" : "▶"}</span>
                </div>
              </div>

              {expandedQuiz === q.id && (
                <div className="p-4" style={{ borderTop: "1px solid var(--hairline)", background: "var(--card-bg)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="m-eyebrow">Questions</h3>
                    <button
                      onClick={() =>
                        setEditingQ({
                          quiz_id: q.id,
                          question_type: "mcq",
                          question_en: "",
                          question_kn: "",
                          question_hi: "",
                          options: ["", "", "", ""],
                          correct_answer: 0,
                          difficulty: "medium",
                          image_url: "",
                          grid_size: 3,
                        })
                      }
                      className="m-btn m-btn-primary"
                      style={btnSmall}
                    >
                      + Add Question
                    </button>
                  </div>
                  {(questions[q.id] || []).length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--ink-muted)" }}>No questions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {(questions[q.id] || []).map((ques, i) => (
                        <div key={ques.id} className="p-3 rounded-lg flex items-start justify-between gap-3" style={{ background: "var(--bg-raised)", border: "1px solid var(--hairline)" }}>
                          <div className="min-w-0">
                            <p className="text-sm font-medium" style={{ color: "var(--ivory)" }}>
                              {i + 1}. {ques.question_type === "puzzle" ? `Jigsaw puzzle (${ques.grid_size}×${ques.grid_size})` : ques.question_en}
                            </p>
                            {ques.question_type === "puzzle" ? (
                              <p className="text-xs mt-1 truncate" style={{ color: "var(--ink-muted)" }}>
                                Image: {ques.image_url || "—"}
                              </p>
                            ) : (
                              <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>
                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium mr-1" style={{
                                  background: ques.difficulty === "easy" ? "rgba(122, 158, 125, 0.15)" : ques.difficulty === "hard" ? "rgba(224, 123, 46, 0.15)" : "rgba(212, 163, 79, 0.15)",
                                  color: ques.difficulty === "easy" ? "#7A9E7D" : ques.difficulty === "hard" ? "var(--saffron)" : "var(--gold)",
                                }}>
                                  {ques.difficulty === "easy" ? "Easy" : ques.difficulty === "hard" ? "Hard" : "Medium"}
                                </span>
                                Answer: {ques.correct_answer >= 0 ? String.fromCharCode(65 + ques.correct_answer) : "—"}
                                {ques.correct_answer >= 0 && ques.options[ques.correct_answer] !== undefined
                                  ? ` · ${ques.options[ques.correct_answer]}`
                                  : ""}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setEditingQuiz(null);
                                setEditingQ({
                                  id: ques.id,
                                  quiz_id: ques.quiz_id,
                                  question_type: ques.question_type === "puzzle" ? "puzzle" : "mcq",
                                  question_en: ques.question_en || "",
                                  question_kn: ques.question_kn || "",
                                  question_hi: ques.question_hi || "",
                                  options:
                                    ques.options.length >= 4
                                      ? [...ques.options]
                                      : [...ques.options, ...Array(4 - ques.options.length).fill("")],
                                  correct_answer: ques.correct_answer >= 0 ? ques.correct_answer : 0,
                                  difficulty: ques.difficulty || "medium",
                                  image_url: ques.image_url || "",
                                  grid_size: ques.grid_size === 4 ? 4 : 3,
                                });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="m-btn m-btn-ghost"
                              style={btnSmall}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteQuestion(ques)}
                              className="m-btn m-btn-ghost"
                              style={{ ...btnSmall, color: "#E08A7E" }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
