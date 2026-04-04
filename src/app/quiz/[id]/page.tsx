"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { use } from "react";

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface QuizInfo {
  title: string;
  time_limit_minutes: number;
  passing_score: number;
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
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [quiz, setQuiz] = useState<QuizInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [name, setName] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const lastTouch = useRef(Date.now());

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
    if (phase !== "quiz" || result || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, result, timeLeft]);

  const submitQuiz = useCallback(async () => {
    if (submitting || result || Object.keys(answers).length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, visitor_name: name || "Visitor" }),
      });
      const data = await res.json();
      setResult(data);
      setPhase("result");
    } catch {
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, name, submitting, result]);

  useEffect(() => {
    if (phase === "quiz" && timeLeft === 0 && !result && Object.keys(answers).length > 0) {
      submitQuiz();
    }
  }, [timeLeft, phase, result, answers, submitQuiz]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const [started, setStarted] = useState(false);

  const startQuiz = () => {
    if (!name.trim()) return;
    setPhase("quiz");
    setStarted(true);
  };

  const answeredCount = Object.keys(answers).length;

  // INTRO
  if (phase === "intro") {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center p-8"
        style={{ background: '#0A0E27' }}
      >
        {/* Ambient */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(212,163,79,0.04) 0%, transparent 60%)'
        }} />

        <div className="text-center max-w-lg relative z-10">
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'rgba(212,163,79,0.08)', border: '1px solid rgba(212,163,79,0.15)' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4A34F" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          <h1
            className="text-4xl font-semibold mb-3"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5F0E8' }}
          >
            {quiz?.title || "Knowledge Quiz"}
          </h1>
          <p className="text-base mb-10" style={{ color: '#8B8FA3' }}>
            Test your understanding of Swami Vivekananda&apos;s life and teachings.
          </p>

          {quiz && (
            <div className="flex gap-8 justify-center mb-10">
              <div className="text-center">
                <div className="text-2xl font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#E8B84B' }}>{questions.length}</div>
                <div className="text-xs mt-1" style={{ color: '#8B8FA3' }}>Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#E8B84B' }}>{quiz.time_limit_minutes}</div>
                <div className="text-xs mt-1" style={{ color: '#8B8FA3' }}>Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#E8B84B' }}>{quiz.passing_score}%</div>
                <div className="text-xs mt-1" style={{ color: '#8B8FA3' }}>To Pass</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name for the certificate"
              className="w-full px-6 py-4 rounded-xl text-center text-base focus:outline-none transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F5F0E8',
              }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'rgba(212,163,79,0.4)'; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
              onKeyDown={(e) => e.key === "Enter" && startQuiz()}
            />
            <button
              onClick={startQuiz}
              disabled={!name.trim()}
              className="w-full py-4 rounded-xl font-medium text-base transition-all duration-300 disabled:opacity-30 active:scale-[0.98]"
              style={{
                background: 'rgba(212,163,79,0.15)',
                color: '#E8B84B',
                border: '1px solid rgba(212,163,79,0.3)',
              }}
            >
              Begin the Quiz &rarr;
            </button>
          </div>

          <p className="text-[10px] mt-6" style={{ color: 'rgba(139,143,163,0.4)' }}>
            Your progress is saved as you go
          </p>
        </div>
      </div>
    );
  }

  // RESULT
  if (phase === "result" && result) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center p-8 overflow-y-auto"
        style={{ background: '#0A0E27' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: result.passed
            ? 'radial-gradient(ellipse at 50% 40%, rgba(212,163,79,0.06) 0%, transparent 60%)'
            : 'none'
        }} />

        <div className="text-center max-w-lg w-full relative z-10">
          {/* Trophy/Book icon */}
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{
              background: result.passed ? 'rgba(212,163,79,0.1)' : 'rgba(255,255,255,0.04)',
              border: result.passed ? '1px solid rgba(212,163,79,0.2)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {result.passed ? (
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#D4A34F" strokeWidth="1.5">
                <path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 1012 0V2z" />
              </svg>
            ) : (
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#8B8FA3" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            )}
          </div>

          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5F0E8' }}
          >
            {result.passed ? 'Congratulations!' : 'Good Effort!'}
          </h1>

          <p className="mb-8 text-sm" style={{ color: '#8B8FA3' }}>
            {result.passed
              ? `${name}, you have demonstrated your knowledge of Swami Vivekananda's teachings.`
              : `Keep learning about Swami Vivekananda's wisdom. Try again!`}
          </p>

          {/* Score */}
          <div
            className="rounded-2xl p-8 mb-6"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="text-5xl font-semibold mb-2" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5F0E8' }}>
              {result.score}/{result.total}
            </div>
            <div
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: '"Cormorant Garamond", serif', color: result.passed ? '#D4A34F' : '#8B8FA3' }}
            >
              {result.percentage}%
            </div>
            <div className="flex gap-2 justify-center">
              {[...Array(result.total)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ background: i < result.score ? '#D4A34F' : 'rgba(255,255,255,0.06)' }}
                />
              ))}
            </div>
          </div>

          {result.passed && (
            <div className="space-y-3">
              <p
                className="italic text-sm"
                style={{ fontFamily: '"Cormorant Garamond", serif', color: '#8B8FA3' }}
              >
                &ldquo;You have to grow from the inside out. None can teach you.&rdquo;
              </p>
              <a
                href={`/api/quiz/certificates/${result.attempt_id}`}
                className="block w-full py-4 rounded-xl font-medium text-base transition-all duration-300 active:scale-[0.98]"
                style={{
                  background: 'rgba(212,163,79,0.15)',
                  color: '#E8B84B',
                  border: '1px solid rgba(212,163,79,0.3)',
                }}
              >
                Download Certificate
              </a>
            </div>
          )}

          {!result.passed && (
            <button
              onClick={() => { setPhase("quiz"); setAnswers({}); setCurrentQ(0); }}
              className="w-full py-4 rounded-xl font-medium text-base transition-all duration-300 active:scale-[0.98]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: '#F5F0E8',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              Try Again
            </button>
          )}

          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 text-sm transition-colors duration-300"
            style={{ color: '#8B8FA3' }}
          >
            &larr; Return to Home
          </button>
        </div>
      </div>
    );
  }

  // QUIZ
  const q = questions[currentQ];

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0A0E27' }}>
        <div className="w-12 h-12 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: '#D4A34F' }} />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: '#0A0E27' }}
    >
      {/* Header */}
      <header className="shrink-0 px-8 py-5 flex items-center justify-between">
        <div className="text-sm" style={{ color: '#8B8FA3' }}>
          Question {currentQ + 1} of {questions.length}
        </div>

        <div
          className="px-4 py-1.5 rounded-full font-mono text-sm"
          style={{
            background: timeLeft < 60 ? 'rgba(220,60,60,0.1)' : 'rgba(212,163,79,0.1)',
            color: timeLeft < 60 ? '#dc3c3c' : '#D4A34F',
            border: `1px solid ${timeLeft < 60 ? 'rgba(220,60,60,0.2)' : 'rgba(212,163,79,0.2)'}`,
            animation: timeLeft < 60 ? 'pulseGold 2s ease-in-out infinite' : 'none',
          }}
        >
          {formatTimer(timeLeft)}
        </div>

        <div className="text-sm" style={{ color: 'rgba(139,143,163,0.5)' }}>
          {answeredCount} answered
        </div>
      </header>

      {/* Progress bar */}
      <div className="shrink-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${((currentQ + 1) / questions.length) * 100}%`,
            background: 'linear-gradient(90deg, #D4A34F, #E8B84B)',
          }}
        />
      </div>

      {/* Question dots */}
      <div className="shrink-0 flex gap-2 justify-center py-4 flex-wrap px-8">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className="w-8 h-8 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center"
            style={{
              background: i === currentQ
                ? 'rgba(212,163,79,0.2)'
                : answers[questions[i].id] !== undefined
                  ? 'rgba(212,163,79,0.1)'
                  : 'rgba(255,255,255,0.04)',
              color: i === currentQ
                ? '#E8B84B'
                : answers[questions[i].id] !== undefined
                  ? '#D4A34F'
                  : 'rgba(139,143,163,0.5)',
              border: i === currentQ
                ? '1px solid rgba(212,163,79,0.4)'
                : '1px solid transparent',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <main className="flex-1 overflow-y-auto px-8 py-6 max-w-3xl mx-auto w-full">
        <div
          className="rounded-2xl p-8 mb-6"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h2
            className="text-2xl md:text-3xl font-semibold leading-relaxed"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5F0E8', lineHeight: '1.5' }}
          >
            {q?.question}
          </h2>
        </div>

        <div className="space-y-3">
          {q?.options.map((option, i) => (
            <button
              key={i}
              onClick={() => {
                setAnswers({ ...answers, [q.id]: i });
                setTimeout(() => {
                  if (currentQ < questions.length - 1) {
                    setCurrentQ(currentQ + 1);
                  }
                }, 300);
              }}
              className="w-full text-left px-6 py-5 rounded-xl transition-all duration-300 font-medium text-base"
              style={{
                background: answers[q.id] === i ? 'rgba(212,163,79,0.1)' : 'rgba(255,255,255,0.02)',
                border: answers[q.id] === i ? '1px solid rgba(212,163,79,0.3)' : '1px solid rgba(255,255,255,0.06)',
                color: answers[q.id] === i ? '#F5F0E8' : 'rgba(245,240,232,0.7)',
              }}
            >
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-full mr-4 text-sm font-medium shrink-0"
                style={{
                  background: answers[q.id] === i ? 'rgba(212,163,79,0.2)' : 'rgba(255,255,255,0.05)',
                  color: answers[q.id] === i ? '#E8B84B' : '#8B8FA3',
                  border: answers[q.id] === i ? '1px solid rgba(212,163,79,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          ))}
        </div>
      </main>

      {/* Bottom nav */}
      <div className="shrink-0 px-8 py-5 flex gap-4">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="px-6 py-4 rounded-xl font-medium disabled:opacity-20 transition-all duration-300"
          style={{ background: 'rgba(255,255,255,0.03)', color: '#8B8FA3', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          &larr; Previous
        </button>

        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            className="flex-1 py-4 rounded-xl font-medium text-base transition-all duration-300 active:scale-[0.98]"
            style={{
              background: 'rgba(212,163,79,0.12)',
              color: '#E8B84B',
              border: '1px solid rgba(212,163,79,0.25)',
            }}
          >
            Next &rarr;
          </button>
        ) : (
          <button
            onClick={submitQuiz}
            disabled={submitting || answeredCount < questions.length}
            className="flex-1 py-4 rounded-xl font-medium text-base transition-all duration-300 disabled:opacity-30 active:scale-[0.98]"
            style={{
              background: answeredCount === questions.length ? 'rgba(212,163,79,0.15)' : 'rgba(255,255,255,0.04)',
              color: answeredCount === questions.length ? '#E8B84B' : '#8B8FA3',
              border: answeredCount === questions.length ? '1px solid rgba(212,163,79,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {submitting ? "Submitting..." : `Submit Quiz (${answeredCount}/${questions.length})`}
          </button>
        )}
      </div>
    </div>
  );
}
