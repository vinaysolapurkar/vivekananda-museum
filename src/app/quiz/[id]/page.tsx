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
  review?: Array<{ question_id: number; correct_index: number; selected_index: number; correct: boolean }>;
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
        style={{ background: '#1a0f0a' }}
      >
        {/* Ambient */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(212,163,79,0.04) 0%, transparent 60%)'
        }} />
        {/* Vivekananda watermark */}
        <div className="absolute inset-0 vivekananda-watermark opacity-[0.05] pointer-events-none" style={{
          backgroundPosition: 'center center',
          backgroundSize: 'auto 70%',
        }} />

        <div className="text-center w-full px-8 relative z-10">
          {/* Vivekananda portrait icon */}
          <div
            className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-8"
            style={{ border: '2px solid rgba(212,163,79,0.3)', boxShadow: '0 0 40px rgba(212,163,79,0.15)' }}
          >
            <img src="/images/vivekananda-portrait.jpg" alt="Swami Vivekananda" className="w-full h-full object-cover" />
          </div>

          <h1
            className="text-4xl font-semibold mb-3"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}
          >
            {quiz?.title || "Knowledge Quiz"}
          </h1>
          <p className="text-base mb-10" style={{ color: '#9B8A72' }}>
            Test your understanding of Swami Vivekananda&apos;s life and teachings.
          </p>

          {quiz && (
            <div className="flex gap-8 justify-center mb-10">
              <div className="text-center">
                <div className="text-2xl font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#E8C06A' }}>{questions.length}</div>
                <div className="text-xs mt-1" style={{ color: '#9B8A72' }}>Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#E8C06A' }}>{quiz.time_limit_minutes}</div>
                <div className="text-xs mt-1" style={{ color: '#9B8A72' }}>Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#E8C06A' }}>{quiz.passing_score}%</div>
                <div className="text-xs mt-1" style={{ color: '#9B8A72' }}>To Pass</div>
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
                background: 'rgba(255,245,230,0.04)',
                border: '1px solid rgba(212,163,79,0.1)',
                color: '#F5EDE0',
              }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'rgba(212,163,79,0.4)'; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = 'rgba(212,163,79,0.1)'; }}
              onKeyDown={(e) => e.key === "Enter" && startQuiz()}
            />
            <button
              onClick={startQuiz}
              disabled={!name.trim()}
              className="w-full py-4 rounded-xl font-medium text-base transition-all duration-300 disabled:opacity-30 active:scale-[0.98]"
              style={{
                background: 'rgba(212,163,79,0.15)',
                color: '#E8C06A',
                border: '1px solid rgba(212,163,79,0.3)',
              }}
            >
              Begin the Quiz &rarr;
            </button>
          </div>

          <p className="text-[10px] mt-6" style={{ color: 'rgba(155,138,114,0.4)' }}>
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
        style={{ background: '#1a0f0a' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: result.passed
            ? 'radial-gradient(ellipse at 50% 40%, rgba(212,163,79,0.06) 0%, transparent 60%)'
            : 'none'
        }} />
        {/* Vivekananda watermark */}
        <div className="absolute inset-0 vivekananda-watermark opacity-[0.04] pointer-events-none" style={{
          backgroundPosition: 'center center',
          backgroundSize: 'auto 65%',
        }} />

        <div className="text-center w-full px-8 relative z-10">
          {/* Vivekananda portrait / Book icon */}
          <div
            className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-8"
            style={{
              border: result.passed ? '2px solid rgba(212,163,79,0.3)' : '2px solid rgba(255,255,255,0.1)',
              boxShadow: result.passed ? '0 0 40px rgba(212,163,79,0.15)' : 'none',
            }}
          >
            <img src="/images/vivekananda-portrait.jpg" alt="Swami Vivekananda" className="w-full h-full object-cover" style={{ opacity: result.passed ? 1 : 0.5 }} />
          </div>

          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}
          >
            {result.passed ? 'Congratulations!' : 'Good Effort!'}
          </h1>

          <p className="mb-8 text-sm" style={{ color: '#9B8A72' }}>
            {result.passed
              ? `${name}, you have demonstrated your knowledge of Swami Vivekananda's teachings.`
              : `Keep learning about Swami Vivekananda's wisdom. Try again!`}
          </p>

          {/* Score */}
          <div
            className="rounded-2xl p-8 mb-6"
            style={{
              background: 'rgba(255,245,230,0.03)',
              border: '1px solid rgba(212,163,79,0.08)',
            }}
          >
            <div className="text-5xl font-semibold mb-2" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}>
              {result.score}/{result.total}
            </div>
            <div
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: '"Cormorant Garamond", serif', color: result.passed ? '#D4A34F' : '#9B8A72' }}
            >
              {result.percentage}%
            </div>
            <div className="flex gap-2 justify-center">
              {[...Array(result.total)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ background: i < result.score ? '#D4A34F' : 'rgba(212,163,79,0.08)' }}
                />
              ))}
            </div>
          </div>

          {/* Answer review */}
          {result.review && result.review.length > 0 && (
            <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: 'rgba(255,245,230,0.03)', border: '1px solid rgba(212,163,79,0.08)' }}>
              <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: '#9B8A72' }}>Answer Review</p>
              <div className="space-y-2">
                {result.review.map((r, i) => {
                  const q = questions[i];
                  if (!q) return null;
                  return (
                    <div key={r.question_id} className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid rgba(212,163,79,0.06)' }}>
                      <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{
                        background: r.correct ? 'rgba(90,160,90,0.15)' : 'rgba(180,60,60,0.15)',
                        color: r.correct ? '#6a6' : '#c66',
                      }}>
                        {r.correct ? '✓' : '✗'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1" style={{ color: '#D9CBBA' }}>{q.question}</p>
                        {!r.correct && (
                          <p className="text-xs" style={{ color: '#9B8A72' }}>
                            Your answer: <span style={{ color: '#c88' }}>{q.options[r.selected_index]}</span>
                            {' · '}Correct: <span style={{ color: '#6a6' }}>{q.options[r.correct_index]}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.passed && (
            <div className="space-y-3">
              <p
                className="italic text-sm"
                style={{ fontFamily: '"Cormorant Garamond", serif', color: '#9B8A72' }}
              >
                &ldquo;You have to grow from the inside out. None can teach you.&rdquo;
              </p>
              <a
                href={`/api/quiz/certificates/${result.attempt_id}`}
                className="block w-full py-4 rounded-xl font-medium text-base transition-all duration-300 active:scale-[0.98]"
                style={{
                  background: 'rgba(212,163,79,0.15)',
                  color: '#E8C06A',
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
                background: 'rgba(255,245,230,0.04)',
                color: '#F5EDE0',
                border: '1px solid rgba(212,163,79,0.1)',
              }}
            >
              Try Again
            </button>
          )}

          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 text-sm transition-colors duration-300"
            style={{ color: '#9B8A72' }}
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
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#1a0f0a' }}>
        <div className="w-12 h-12 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: '#D4A34F' }} />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: '#1a0f0a' }}
    >
      {/* Vivekananda watermark */}
      <div className="absolute inset-0 vivekananda-watermark opacity-[0.02] pointer-events-none" style={{
        backgroundPosition: 'right bottom',
        backgroundSize: 'auto 50%',
      }} />
      {/* Header */}
      <header className="shrink-0 px-8 py-5 flex items-center justify-between relative z-10">
        <div className="text-sm" style={{ color: '#9B8A72' }}>
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

        <div className="text-sm" style={{ color: 'rgba(155,138,114,0.5)' }}>
          {answeredCount} answered
        </div>
      </header>

      {/* Progress bar */}
      <div className="shrink-0 h-[2px]" style={{ background: 'rgba(255,245,230,0.04)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${((currentQ + 1) / questions.length) * 100}%`,
            background: 'linear-gradient(90deg, #D4A34F, #E8C06A)',
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
                  : 'rgba(255,245,230,0.04)',
              color: i === currentQ
                ? '#E8C06A'
                : answers[questions[i].id] !== undefined
                  ? '#D4A34F'
                  : 'rgba(155,138,114,0.5)',
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
      <main className="flex-1 overflow-y-auto px-8 py-6 w-full">
        <div
          className="rounded-2xl p-8 mb-6"
          style={{
            background: 'rgba(255,245,230,0.03)',
            border: '1px solid rgba(212,163,79,0.08)',
          }}
        >
          <h2
            className="text-2xl md:text-3xl font-semibold leading-relaxed"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0', lineHeight: '1.5' }}
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
                background: answers[q.id] === i ? 'rgba(212,163,79,0.1)' : 'rgba(255,245,230,0.03)',
                border: answers[q.id] === i ? '1px solid rgba(212,163,79,0.3)' : '1px solid rgba(212,163,79,0.08)',
                color: answers[q.id] === i ? '#F5EDE0' : 'rgba(217,203,186,0.8)',
              }}
            >
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-full mr-4 text-sm font-medium shrink-0"
                style={{
                  background: answers[q.id] === i ? 'rgba(212,163,79,0.2)' : 'rgba(255,245,230,0.05)',
                  color: answers[q.id] === i ? '#E8C06A' : '#9B8A72',
                  border: answers[q.id] === i ? '1px solid rgba(212,163,79,0.3)' : '1px solid rgba(212,163,79,0.08)',
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
          style={{ background: 'rgba(255,245,230,0.03)', color: '#9B8A72', border: '1px solid rgba(212,163,79,0.08)' }}
        >
          &larr; Previous
        </button>

        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            className="flex-1 py-4 rounded-xl font-medium text-base transition-all duration-300 active:scale-[0.98]"
            style={{
              background: 'rgba(212,163,79,0.12)',
              color: '#E8C06A',
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
              background: answeredCount === questions.length ? 'rgba(212,163,79,0.15)' : 'rgba(255,245,230,0.04)',
              color: answeredCount === questions.length ? '#E8C06A' : '#9B8A72',
              border: answeredCount === questions.length ? '1px solid rgba(212,163,79,0.3)' : '1px solid rgba(212,163,79,0.08)',
            }}
          >
            {submitting ? "Submitting..." : `Submit Quiz (${answeredCount}/${questions.length})`}
          </button>
        )}
      </div>
    </div>
  );
}
