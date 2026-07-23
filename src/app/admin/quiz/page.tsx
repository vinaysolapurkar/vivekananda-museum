"use client";

import { useState, useEffect } from "react";

interface Quiz {
  id: number;
  title: string;
  time_limit_minutes: number;
  passing_score: number;
  is_active: boolean;
}

interface Question {
  id: number;
  quiz_id: number;
  question_en: string;
  options_en: string;
  correct_answer: number;
  difficulty: string;
}

const btnPrimary: React.CSSProperties = { minHeight: 40, fontSize: "0.85rem", padding: "0 1.1rem" };
const btnSmall: React.CSSProperties = { minHeight: 30, fontSize: "0.75rem", padding: "0 0.7rem" };

export default function AdminQuiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Record<number, Question[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingQuiz, setEditingQuiz] = useState<Partial<Quiz> | null>(null);
  const [editingQ, setEditingQ] = useState<{
    quiz_id: number;
    question_en: string;
    question_kn: string;
    question_hi: string;
    options: string[];
    correct_answer: number;
    difficulty: string;
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

  const saveQuiz = async () => {
    if (!editingQuiz) return;
    setSaving(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingQuiz),
      });
      if (res.ok) {
        setEditingQuiz(null);
        setMsg("Quiz saved!");
        fetchQuizzes();
      }
    } catch {
      setMsg("Error saving");
    } finally {
      setSaving(false);
    }
  };

  const saveQuestion = async () => {
    if (!editingQ) return;
    setSaving(true);
    try {
      const res = await fetch("/api/quiz/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: editingQ.quiz_id,
          question_en: editingQ.question_en,
          question_kn: editingQ.question_kn,
          question_hi: editingQ.question_hi,
          options_en: JSON.stringify(editingQ.options),
          correct_answer: editingQ.correct_answer,
          difficulty: editingQ.difficulty,
        }),
      });
      if (res.ok) {
        setEditingQ(null);
        setMsg("Question saved!");
        fetchQuestions(editingQ.quiz_id);
      }
    } catch {
      setMsg("Error saving question");
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
            setEditingQuiz({ title: "", time_limit_minutes: 10, passing_score: 50 })
          }
          className="m-btn m-btn-primary"
          style={btnPrimary}
        >
          + Add Quiz
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 rounded-lg text-sm" style={{ background: "rgba(212, 163, 79, 0.1)", border: "1px solid var(--hairline)", color: "var(--gold)" }}>{msg}</div>
      )}

      {/* New Quiz Form */}
      {editingQuiz && (
        <div className="m-card p-6 mb-6">
          <h2 className="text-xl mb-4" style={{ color: "var(--ivory)" }}>New Quiz</h2>
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
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveQuiz} disabled={saving} className="m-btn m-btn-primary disabled:opacity-50" style={btnPrimary}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditingQuiz(null)} className="m-btn m-btn-ghost" style={btnPrimary}>Cancel</button>
          </div>
        </div>
      )}

      {/* New Question Form */}
      {editingQ && (
        <div className="m-card p-6 mb-6">
          <h2 className="text-xl mb-4" style={{ color: "var(--ivory)" }}>New Question</h2>
          <div className="space-y-4">
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
              <option value="easy">Easy (Children &amp; All Ages)</option>
              <option value="medium">Medium (All Ages)</option>
              <option value="hard">Hard (Adults Only)</option>
            </select>
            <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
              Easy = shown to children (12 &amp; under) + teens. Medium = shown to everyone. Hard = shown to adults (18+) + teens only.
            </p>
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
              <button
                onClick={() => toggleExpand(q.id)}
                className="w-full p-4 flex items-center justify-between transition-colors hover:bg-white/5"
              >
                <div>
                  <p className="font-semibold text-left" style={{ color: "var(--ivory)" }}>{q.title}</p>
                  <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                    {q.time_limit_minutes} min · Pass: {q.passing_score}%
                  </p>
                </div>
                <span style={{ color: "var(--ink-faint)" }}>{expandedQuiz === q.id ? "▼" : "▶"}</span>
              </button>

              {expandedQuiz === q.id && (
                <div className="p-4" style={{ borderTop: "1px solid var(--hairline)", background: "var(--card-bg)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="m-eyebrow">Questions</h3>
                    <button
                      onClick={() =>
                        setEditingQ({
                          quiz_id: q.id,
                          question_en: "",
                          question_kn: "",
                          question_hi: "",
                          options: ["", "", "", ""],
                          correct_answer: 0,
                          difficulty: "medium",
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
                        <div key={ques.id} className="p-3 rounded-lg" style={{ background: "var(--bg-raised)", border: "1px solid var(--hairline)" }}>
                          <p className="text-sm font-medium" style={{ color: "var(--ivory)" }}>
                            {i + 1}. {ques.question_en}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium mr-1" style={{
                              background: ques.difficulty === "easy" ? "rgba(122, 158, 125, 0.15)" : ques.difficulty === "hard" ? "rgba(224, 123, 46, 0.15)" : "rgba(212, 163, 79, 0.15)",
                              color: ques.difficulty === "easy" ? "#7A9E7D" : ques.difficulty === "hard" ? "var(--saffron)" : "var(--gold)",
                            }}>
                              {ques.difficulty === "easy" ? "Children + All" : ques.difficulty === "hard" ? "Adults Only" : "All Ages"}
                            </span>
                            Answer: {String.fromCharCode(65 + ques.correct_answer)}
                          </p>
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
