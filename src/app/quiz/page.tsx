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
    <div className="flex flex-col min-h-screen relative" style={{
      background: 'linear-gradient(170deg, #1a0f0a 0%, #2a1810 30%, #1c1008 100%)',
    }}>
      {/* Vivekananda watermark */}
      <div className="fixed top-0 right-0 bottom-0 w-[40%] pointer-events-none z-0 opacity-[0.05]" style={{
        backgroundImage: 'url(/images/vivekananda-portrait.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right center',
        backgroundSize: 'auto 70%',
        maskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
        filter: 'sepia(0.4) brightness(1.2)',
      }} />

      <header className="relative z-10 px-6 py-5" style={{
        background: 'rgba(58,26,18,0.4)',
        borderBottom: '1px solid rgba(212,163,79,0.1)',
      }}>
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: '#D4A34F' }}>← Home</Link>
          <h1 className="text-xl font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}>Quizzes</h1>
          <div className="w-14" />
        </div>
      </header>

      <main className="flex-1 p-6 w-full relative z-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: '#D4A34F' }} />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4" style={{ border: '1.5px solid rgba(212,163,79,0.2)' }}>
              <img src="/images/vivekananda-portrait.jpg" alt="" className="w-full h-full object-cover" style={{ opacity: 0.5, filter: 'sepia(0.3)' }} />
            </div>
            <p className="text-lg" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#D9CBBA' }}>No quizzes available yet</p>
            <Link href="/admin/quiz" className="text-sm hover:underline mt-2 inline-block" style={{ color: '#D4A34F' }}>
              Create quizzes in Admin
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((q) => (
              <Link
                key={q.id}
                href={`/quiz/${q.id}`}
                className="block rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'rgba(255,245,230,0.04)',
                  border: '1px solid rgba(212,163,79,0.1)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                }}
              >
                <h2 className="text-lg font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}>{q.title}</h2>
                <div className="flex gap-4 mt-2 text-sm" style={{ color: '#9B8A72' }}>
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
