"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Quiz {
  id: number;
  title: string;
  time_limit_minutes: number;
  passing_score: number;
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quiz")
      .then((r) => r.json())
      .then((data) => setQuizzes(data.quizzes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="bg-primary text-text-light px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link href="/" className="text-saffron text-2xl">←</Link>
          <h1 className="text-lg font-heading font-semibold">Quizzes</h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p className="text-lg">No quizzes available yet</p>
            <Link href="/admin/quiz" className="text-primary hover:underline mt-2 inline-block">
              Create quizzes in Admin
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((q) => (
              <Link
                key={q.id}
                href={`/quiz/${q.id}`}
                className="block bg-white border border-border rounded-xl p-5 hover:shadow-md hover:border-saffron/40 transition-all"
              >
                <h2 className="text-lg font-heading font-semibold text-primary">{q.title}</h2>
                <div className="flex gap-4 mt-2 text-sm text-text-muted">
                  <span>{q.time_limit_minutes} min</span>
                  <span>Pass: {q.passing_score}%</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
