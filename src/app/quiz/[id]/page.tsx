"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import Link from "next/link";

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface QuizInfo {
  title: string;
  time_limit_minutes: number;
}

interface Result {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  certificate_url: string;
  attempt_id: number;
}

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<QuizInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetch(`/api/quiz/${id}/questions?lang=en`)
      .then((r) => r.json())
      .then((data) => {
        setQuiz(data.quiz);
        setQuestions(data.questions || []);
        if (data.quiz) setTimeLeft(data.quiz.time_limit_minutes * 60);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Timer
  useEffect(() => {
    if (!started || result || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, result, timeLeft]);

  // Auto-submit when time runs out
  const submitQuiz = useCallback(async () => {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, visitor_name: name }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      alert("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, name, submitting, result]);

  useEffect(() => {
    if (started && timeLeft === 0 && !result) {
      submitQuiz();
    }
  }, [timeLeft, started, result, submitQuiz]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-6 text-center">
        <p className="text-xl text-text-muted mb-4">Quiz not found or no questions</p>
        <Link href="/quiz" className="text-primary hover:underline">← Back to quizzes</Link>
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-6 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div
            className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl ${
              result.passed ? "bg-accent/10 text-accent" : "bg-red-50 text-red-500"
            }`}
          >
            {result.passed ? "🏆" : "📚"}
          </div>
          <h2 className="text-2xl font-heading font-bold text-primary mb-2">
            {result.passed ? "Congratulations!" : "Keep Learning!"}
          </h2>
          <p className="text-3xl font-bold text-saffron mb-1">
            {result.score}/{result.total}
          </p>
          <p className="text-text-muted mb-6">{result.percentage}% correct</p>

          {result.passed && (
            <Link
              href={`/api/quiz/certificates/${result.attempt_id}`}
              className="inline-block bg-saffron text-white px-6 py-3 rounded-xl font-semibold hover:bg-saffron-dark transition-colors mb-4"
            >
              Download Certificate
            </Link>
          )}

          <div className="mt-4 p-4 bg-saffron/5 rounded-xl border border-saffron/20">
            <p className="italic text-text-dark font-heading text-sm">
              &ldquo;All power is within you; you can do anything and everything.&rdquo;
            </p>
            <p className="text-xs text-text-muted mt-1">— Swami Vivekananda</p>
          </div>

          <div className="flex gap-3 mt-6">
            <Link
              href="/quiz"
              className="flex-1 py-3 rounded-xl border border-border text-primary font-semibold hover:bg-surface transition-colors"
            >
              All Quizzes
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 rounded-xl bg-primary text-text-light font-semibold hover:bg-primary-light transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Name entry screen
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-heading font-bold text-primary mb-2">{quiz.title}</h1>
          <p className="text-text-muted mb-6">
            {questions.length} questions · {quiz.time_limit_minutes} minutes
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-border rounded-xl mb-4 text-center text-lg focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => name.trim() && setStarted(true)}
            disabled={!name.trim()}
            className="w-full py-3 bg-saffron text-white rounded-xl font-semibold text-lg disabled:opacity-40 hover:bg-saffron-dark transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header with timer and progress */}
      <header className="bg-primary text-text-light px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <span className="text-sm opacity-80">
            {currentQ + 1} / {questions.length}
          </span>
          <span
            className={`font-mono font-bold text-lg ${
              timeLeft < 60 ? "text-red-400 animate-pulse" : "text-saffron"
            }`}
          >
            {formatTimer(timeLeft)}
          </span>
        </div>
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-saffron rounded-full transition-all"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <h2 className="text-xl font-heading font-semibold text-primary mb-6">
          {q.question}
        </h2>

        <div className="space-y-3">
          {q.options.map((option, i) => (
            <button
              key={i}
              onClick={() => setAnswers({ ...answers, [q.id]: i })}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium ${
                answers[q.id] === i
                  ? "border-saffron bg-saffron/10 text-saffron-dark"
                  : "border-border bg-white hover:border-primary/30 text-text-dark"
              }`}
            >
              <span className="inline-block w-8 h-8 rounded-full bg-surface text-center leading-8 text-sm font-bold mr-3">
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          ))}
        </div>
      </main>

      {/* Navigation */}
      <div className="bg-white border-t border-border p-4 sticky bottom-0">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="flex-1 py-3 rounded-xl border border-border text-primary font-semibold disabled:opacity-30 hover:bg-surface transition-colors"
          >
            Previous
          </button>
          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              className="flex-1 py-3 rounded-xl bg-primary text-text-light font-semibold hover:bg-primary-light transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-saffron text-white font-semibold hover:bg-saffron-dark transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
