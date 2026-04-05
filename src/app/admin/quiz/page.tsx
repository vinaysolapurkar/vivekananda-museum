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
        <h1 className="text-2xl font-heading font-bold text-primary">Quizzes</h1>
        <button
          onClick={() =>
            setEditingQuiz({ title: "", time_limit_minutes: 10, passing_score: 50 })
          }
          className="px-4 py-2 bg-saffron text-white rounded-lg font-medium hover:bg-saffron-dark transition-colors"
        >
          + Add Quiz
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 bg-accent/10 text-accent rounded-lg text-sm">{msg}</div>
      )}

      {/* New Quiz Form */}
      {editingQuiz && (
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Quiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Quiz title"
              value={editingQuiz.title || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary md:col-span-3"
            />
            <input
              type="number"
              placeholder="Time limit (minutes)"
              value={editingQuiz.time_limit_minutes || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, time_limit_minutes: parseInt(e.target.value) || 10 })}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
            <input
              type="number"
              placeholder="Passing score (%)"
              value={editingQuiz.passing_score || ""}
              onChange={(e) => setEditingQuiz({ ...editingQuiz, passing_score: parseInt(e.target.value) || 50 })}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveQuiz} disabled={saving} className="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditingQuiz(null)} className="px-6 py-2 border border-border rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {/* New Question Form */}
      {editingQ && (
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Question</h2>
          <div className="space-y-4">
            <input
              placeholder="Question (English)"
              value={editingQ.question_en}
              onChange={(e) => setEditingQ({ ...editingQ, question_en: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Question (Kannada)"
              value={editingQ.question_kn}
              onChange={(e) => setEditingQ({ ...editingQ, question_kn: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
            <input
              placeholder="Question (Hindi)"
              value={editingQ.question_hi}
              onChange={(e) => setEditingQ({ ...editingQ, question_hi: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {editingQ.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={editingQ.correct_answer === i}
                    onChange={() => setEditingQ({ ...editingQ, correct_answer: i })}
                    className="accent-accent"
                  />
                  <input
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    value={opt}
                    onChange={(e) => {
                      const opts = [...editingQ.options];
                      opts[i] = e.target.value;
                      setEditingQ({ ...editingQ, options: opts });
                    }}
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
            <select
              value={editingQ.difficulty}
              onChange={(e) => setEditingQ({ ...editingQ, difficulty: e.target.value })}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={saveQuestion} disabled={saving} className="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditingQ(null)} className="px-6 py-2 border border-border rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quizzes.length === 0 ? (
        <p className="text-center text-text-muted py-10">No quizzes yet.</p>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <div key={q.id} className="bg-white border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleExpand(q.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-surface/50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-text-dark text-left">{q.title}</p>
                  <p className="text-xs text-text-muted">
                    {q.time_limit_minutes} min · Pass: {q.passing_score}%
                  </p>
                </div>
                <span className="text-text-muted">{expandedQuiz === q.id ? "▼" : "▶"}</span>
              </button>

              {expandedQuiz === q.id && (
                <div className="border-t border-border p-4 bg-surface/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text-muted">Questions</h3>
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
                      className="px-3 py-1 text-sm bg-saffron text-white rounded-lg"
                    >
                      + Add Question
                    </button>
                  </div>
                  {(questions[q.id] || []).length === 0 ? (
                    <p className="text-sm text-text-muted">No questions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {(questions[q.id] || []).map((ques, i) => (
                        <div key={ques.id} className="bg-white p-3 rounded-lg border border-border">
                          <p className="text-sm font-medium">
                            {i + 1}. {ques.question_en}
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            Difficulty: {ques.difficulty} · Answer: {String.fromCharCode(65 + ques.correct_answer)}
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
