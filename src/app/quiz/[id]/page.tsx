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

  const startQuiz = () => {
    if (!name.trim()) return;
    setPhase("quiz");
    setStarted(true);
  };

  const [started, setStarted] = useState(false);
  const answeredCount = Object.keys(answers).length;

  // ─── INTRO ───────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div 
        className="fixed inset-0 flex flex-col items-center justify-center p-8"
        style={{ background: 'linear-gradient(160deg, #1A237E 0%, #0D1447 100%)' }}
      >
        <div className="text-center max-w-lg">
          <div className="text-7xl mb-6">📝</div>
          <h1 
            className="text-4xl font-bold text-white mb-3"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {quiz?.title || "Knowledge Quiz"}
          </h1>
          <p className="text-white/60 mb-8 text-lg">
            Test your understanding of Swami Vivekananda's life and teachings.
          </p>

          {quiz && (
            <div className="flex gap-6 justify-center mb-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-saffron">{questions.length}</div>
                <div className="text-white/40 text-sm">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-saffron">{quiz.time_limit_minutes}</div>
                <div className="text-white/40 text-sm">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-saffron">{quiz.passing_score}%</div>
                <div className="text-white/40 text-sm">To Pass</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name for the certificate"
              className="w-full px-6 py-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/40 text-center text-lg focus:outline-none focus:border-saffron"
              onKeyDown={(e) => e.key === "Enter" && startQuiz()}
            />
            <button
              onClick={startQuiz}
              disabled={!name.trim()}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all disabled:opacity-40 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #FF8F00, #FF6F00)', boxShadow: '0 8px 30px rgba(255,143,0,0.4)' }}
            >
              Begin the Quiz →
            </button>
          </div>

          <p className="text-white/30 text-xs mt-6">
            Your progress is saved as you go
          </p>
        </div>
      </div>
    );
  }

  // ─── RESULT ──────────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    return (
      <div 
        className="fixed inset-0 flex flex-col items-center justify-center p-8 overflow-y-auto"
        style={{ background: 'linear-gradient(160deg, #1A237E 0%, #0D1447 100%)' }}
      >
        <div className="text-center max-w-lg w-full">
          <div className="text-8xl mb-6">{result.passed ? '🏆' : '📖'}</div>
          
          <h1 
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {result.passed ? 'Congratulations!' : 'Good Effort!'}
          </h1>
          
          <p className="text-white/60 mb-8">
            {result.passed 
              ? `${name}, you have demonstrated your knowledge of Swami Vivekananda's teachings.`
              : `Keep learning about Swami Vivekananda's wisdom. Try again!`}
          </p>

          {/* Score */}
          <div 
            className="rounded-3xl p-8 mb-6"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="text-6xl font-bold text-white mb-2">
              {result.score}/{result.total}
            </div>
            <div 
              className="text-2xl font-bold mb-4"
              style={{ color: result.passed ? '#4CAF50' : '#FF8F00' }}
            >
              {result.percentage}%
            </div>
            <div className="flex gap-2 justify-center">
              {[...Array(result.total)].map((_, i) => (
                <div 
                  key={i}
                  className="w-4 h-4 rounded-full"
                  style={{ background: i < result.score ? '#4CAF50' : 'rgba(255,255,255,0.1)' }}
                />
              ))}
            </div>
          </div>

          {result.passed && (
            <div className="space-y-3">
              <p 
                className="text-white/60 italic"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                "You have to grow from the inside out. None can teach you."
              </p>
              <a
                href={`/api/quiz/certificates/${result.attempt_id}`}
                className="block w-full py-4 rounded-2xl font-bold text-lg text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #FF8F00, #FF6F00)', boxShadow: '0 8px 30px rgba(255,143,0,0.4)' }}
              >
                🎓 Download Certificate
              </a>
            </div>
          )}

          {!result.passed && (
            <button
              onClick={() => { setPhase("quiz"); setAnswers({}); setCurrentQ(0); }}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)' }}
            >
              🔄 Try Again
            </button>
          )}

          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 text-white/30 text-sm hover:text-white/60 transition-colors"
          >
            ← Return to Home
          </button>
        </div>
      </div>
    );
  }

  // ─── QUIZ ────────────────────────────────────────────────────────────────
  const q = questions[currentQ];

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0D1447' }}>
        <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col"
      style={{ background: '#0D1447' }}
    >
      {/* Header */}
      <header className="shrink-0 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-white/40 text-sm font-medium">
            Question {currentQ + 1} of {questions.length}
          </div>
        </div>
        
        <div 
          className={`px-5 py-2 rounded-full font-mono font-bold text-lg ${
            timeLeft < 60 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-saffron/20 text-saffron'
          }`}
        >
          ⏱ {formatTimer(timeLeft)}
        </div>

        <div className="text-white/30 text-sm">
          {answeredCount} answered
        </div>
      </header>

      {/* Progress bar */}
      <div className="shrink-0 h-1 bg-white/5">
        <div 
          className="h-full transition-all duration-500"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #FF8F00, #FF6F00)' }}
        />
      </div>

      {/* Question dots */}
      <div className="shrink-0 flex gap-2 justify-center py-4 flex-wrap px-8">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className="w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center"
            style={{
              background: i === currentQ ? '#FF8F00' : answers[questions[i].id] !== undefined ? '#4CAF50' : 'rgba(255,255,255,0.1)',
              color: i === currentQ || answers[questions[i].id] !== undefined ? 'white' : 'rgba(255,255,255,0.4)',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <main className="flex-1 overflow-y-auto px-8 py-6 max-w-3xl mx-auto w-full">
        <div 
          className="rounded-3xl p-8 mb-6"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <h2 
            className="text-2xl md:text-3xl font-bold text-white leading-relaxed"
            style={{ fontFamily: 'Playfair Display, serif', lineHeight: '1.5' }}
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
                // Auto-advance after short delay
                setTimeout(() => {
                  if (currentQ < questions.length - 1) {
                    setCurrentQ(currentQ + 1);
                  }
                }, 300);
              }}
              className={`w-full text-left px-6 py-5 rounded-2xl border-2 transition-all font-medium text-lg ${
                answers[q.id] === i
                  ? "border-saffron text-white"
                  : "border-white/10 text-white/70 hover:border-white/30 hover:text-white bg-white/5"
              }`}
              style={{
                background: answers[q.id] === i ? 'rgba(255,143,0,0.15)' : 'rgba(255,255,255,0.03)',
              }}
            >
              <span 
                className="inline-flex items-center justify-center w-10 h-10 rounded-full mr-4 text-sm font-bold shrink-0"
                style={{ 
                  background: answers[q.id] === i ? '#FF8F00' : 'rgba(255,255,255,0.1)',
                  color: answers[q.id] === i ? 'white' : 'rgba(255,255,255,0.5)'
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
          className="px-6 py-4 rounded-2xl border-2 border-white/10 text-white/60 font-semibold disabled:opacity-30 hover:border-white/30 transition-all"
        >
          ← Previous
        </button>

        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            className="flex-1 py-4 rounded-2xl bg-saffron text-white font-bold text-lg hover:bg-saffron-dark transition-all active:scale-[0.98]"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={submitQuiz}
            disabled={submitting || answeredCount < questions.length}
            className="flex-1 py-4 rounded-2xl font-bold text-lg text-white transition-all disabled:opacity-40 active:scale-[0.98]"
            style={{ background: answeredCount === questions.length ? 'linear-gradient(135deg, #4CAF50, #388E3C)' : 'rgba(255,255,255,0.1)' }}
          >
            {submitting ? "Submitting..." : `Submit Quiz (${answeredCount}/${questions.length})`}
          </button>
        )}
      </div>
    </div>
  );
}
