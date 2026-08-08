"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import Link from "next/link";
import MuseumIcon from "@/components/MuseumIcon";
import JigsawPuzzle from "@/components/JigsawPuzzle";
import { useLang } from "@/components/LanguageProvider";

interface Question {
  id: number;
  type: "mcq" | "puzzle";
  difficulty?: string;
  question?: string;
  options?: string[];
  gridSize?: number;
  image_url?: string;
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
  review?: Array<{ question_id: number; correct_index: number; selected_index: number; correct: boolean; puzzle?: boolean }>;
}

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { lang, t } = useLang();
  const kf = lang === "en" ? undefined : "var(--font-kannada)";
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [quiz, setQuiz] = useState<QuizInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | "solved">>({});
  const [feedback, setFeedback] = useState<{ correct: boolean; correctIndex: number } | null>(null);
  const [checking, setChecking] = useState(false);
  const [name, setName] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Fetch a freshly randomized question set on mount — every visit gets its
  // own shuffle of the fixed progressive-difficulty slot plan.
  useEffect(() => {
    fetch(`/api/quiz/${id}/questions?lang=${lang}`)
      .then((r) => r.json())
      .then((data) => {
        setQuiz(data.quiz);
        setQuestions(data.questions || []);
        if (data.quiz) setTimeLeft(data.quiz.time_limit_minutes * 60);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, lang]);

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
    if (submitting || result) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          visitor_name: name || "Visitor",
          question_ids: questions.map((q) => q.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Submission failed. Please try again.");
        return;
      }
      setResult(data);
      setPhase("result");
    } catch {
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, name, submitting, result, questions]);

  // Auto-submit when the timer runs out (even if nothing was answered)
  useEffect(() => {
    if (phase === "quiz" && timeLeft === 0 && !result) {
      submitQuiz();
    }
  }, [timeLeft, phase, result, submitQuiz]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const startQuiz = () => {
    if (!name.trim() || questions.length === 0) return;
    setPhase("quiz");
  };

  const answeredCount = Object.keys(answers).length;
  const q = questions[currentQ];
  const isAnswered = q ? answers[q.id] !== undefined : false;

  // MCQ: lock the pick immediately and ask the server whether it's correct —
  // the answer key never ships to the client up front, only per-question once answered.
  const selectOption = async (i: number) => {
    if (!q || checking || isAnswered) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/quiz/${id}/check-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: q.id, selected_index: i }),
      });
      const data = await res.json();
      setAnswers((prev) => ({ ...prev, [q.id]: i }));
      setFeedback({
        correct: Boolean(data.correct),
        correctIndex: typeof data.correct_index === "number" ? data.correct_index : -1,
      });
    } catch {
      setAnswers((prev) => ({ ...prev, [q.id]: i }));
      setFeedback({ correct: false, correctIndex: -1 });
    } finally {
      setChecking(false);
    }
  };

  const handlePuzzleSolved = () => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: "solved" }));
  };

  const goNext = () => {
    if (!isAnswered) return;
    setFeedback(null);
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      submitQuiz();
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--card-bg)",
    border: "1px solid var(--hairline)",
    color: "var(--ivory)",
    borderRadius: 14,
  };

  // INTRO
  if (phase === "intro") {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center p-6 overflow-y-auto kiosk-scroll"
        style={{ background: "var(--background)" }}
      >
        {/* Hero glow */}
        <div
          className="absolute inset-x-0 top-0 h-[60%] pointer-events-none"
          style={{ background: "var(--bg-hero)" }}
        />
        <div
          className="absolute inset-x-0 top-0 h-[60%] pointer-events-none"
          style={{ background: "var(--diya-glow)" }}
        />

        <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-6 flex items-center justify-between">
          <Link href="/quiz" className="m-btn m-btn-ghost touch-target" style={{ minHeight: 44, fontSize: "0.85rem" }}>
            <MuseumIcon name="arrowLeft" size={16} />
            <span style={{ fontFamily: kf }}>{t("common.back")}</span>
          </Link>
          <Link href="/" className="m-btn m-btn-ghost touch-target" style={{ minHeight: 44, fontSize: "0.85rem" }}>
            <MuseumIcon name="temple" size={16} />
            <span style={{ fontFamily: kf }}>{t("common.home")}</span>
          </Link>
        </header>

        <div className="text-center w-full max-w-lg relative z-10 animate-fade-in-up py-8">
          {/* Portrait */}
          <div
            className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-7"
            style={{
              border: "1px solid var(--hairline-strong)",
              boxShadow: "0 0 44px rgba(224, 123, 46, 0.2)",
            }}
          >
            <img
              src="/images/vivekananda-portrait.jpg"
              alt="Swami Vivekananda"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="m-eyebrow mb-3" style={{ fontFamily: kf }}>{t("quiz.title")}</p>
          <h1
            className="text-4xl sm:text-5xl font-semibold mb-3"
            style={{ color: "var(--ivory)", fontFamily: kf }}
          >
            {quiz?.title || t("quiz.title")}
          </h1>
          <p className="text-base mb-8" style={{ color: "var(--ink-muted)", fontFamily: kf }}>
            {t("quiz.introSubtitle")}
          </p>

          {quiz && (
            <div className="m-card flex justify-center divide-x mb-9" style={{ borderColor: "var(--hairline)" }}>
              {[
                { icon: "scroll", value: String(questions.length), label: t("quiz.questions") },
                { icon: "clock", value: String(quiz.time_limit_minutes), label: t("quiz.minutes") },
                { icon: "award", value: `${quiz.passing_score}%`, label: t("quiz.toPass") },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex-1 py-5 px-2 text-center"
                  style={{ borderColor: "var(--hairline)" }}
                >
                  <div
                    className="flex items-center justify-center gap-2 text-3xl font-semibold"
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      color: "var(--gold)",
                    }}
                  >
                    <MuseumIcon name={s.icon} size={18} strokeWidth={1.5} style={{ opacity: 0.75 }} />
                    {s.value}
                  </div>
                  <div
                    className="text-[11px] uppercase tracking-[0.18em] mt-1.5"
                    style={{ color: "var(--ink-faint)", fontFamily: kf, letterSpacing: lang === "en" ? undefined : "0.04em" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("quiz.enterName")}
              className="w-full px-6 py-4 text-center text-base focus:outline-none transition-all duration-300"
              style={{ ...inputStyle, fontFamily: kf }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--hairline-strong)"; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--hairline)"; }}
              onKeyDown={(e) => e.key === "Enter" && startQuiz()}
            />
            <button
              onClick={startQuiz}
              disabled={!name.trim() || questions.length === 0}
              className="m-btn m-btn-primary w-full disabled:opacity-30 disabled:pointer-events-none"
              style={{ minHeight: 56, fontSize: "1.05rem", fontFamily: kf }}
            >
              <MuseumIcon name="play" size={18} />
              {t("quiz.begin")}
            </button>
          </div>

          <p className="text-[11px] mt-6" style={{ color: "var(--ink-faint)", fontFamily: kf }}>
            {t("quiz.reassurance")}
          </p>
        </div>
      </div>
    );
  }

  // RESULT
  if (phase === "result" && result) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center p-6 overflow-y-auto kiosk-scroll"
        style={{ background: "var(--background)" }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[55%] pointer-events-none"
          style={{
            background: result.passed ? "var(--diya-glow)" : "none",
          }}
        />

        <div className="text-center w-full max-w-lg relative z-10 my-auto py-10 animate-fade-in-up">
          {/* Award badge */}
          <div
            className="mx-auto mb-7 flex items-center justify-center rounded-full"
            style={{
              width: 84,
              height: 84,
              color: result.passed ? "var(--gold)" : "var(--ink-faint)",
              background: "var(--card-bg)",
              border: `1px solid ${result.passed ? "var(--hairline-strong)" : "var(--hairline)"}`,
              boxShadow: result.passed
                ? "0 0 50px rgba(224, 123, 46, 0.22)"
                : "none",
            }}
          >
            <MuseumIcon name="award" size={38} strokeWidth={1.4} />
          </div>

          <p className="m-eyebrow mb-3" style={{ fontFamily: kf }}>
            {result.passed ? t("quiz.certificateEarned") : t("quiz.quizComplete")}
          </p>
          <h1
            className="text-4xl sm:text-5xl font-semibold mb-3"
            style={{ color: "var(--ivory)", fontFamily: kf }}
          >
            {result.passed ? t("quiz.congrats") : t("quiz.goodEffort")}
          </h1>

          <p className="mb-8 text-sm sm:text-base" style={{ color: "var(--ink-muted)", fontFamily: kf }}>
            {result.passed
              ? `${name}, ${t("quiz.passedMsg")}`
              : t("quiz.failMsg")}
          </p>

          {/* Score */}
          <div className="m-card p-8 mb-6">
            <div
              className="text-6xl font-semibold mb-1"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                color: "var(--ivory)",
              }}
            >
              {result.score}
              <span style={{ color: "var(--ink-faint)" }}>/{result.total}</span>
            </div>
            <div
              className="text-2xl font-semibold mb-5"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                color: result.passed ? "var(--gold)" : "var(--ink-muted)",
              }}
            >
              {result.percentage}%
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              {[...Array(result.total)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background:
                      i < result.score ? "var(--gold)" : "var(--card-bg-hover)",
                    border:
                      i < result.score
                        ? "none"
                        : "1px solid var(--hairline)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Answer review */}
          {result.review && result.review.length > 0 && (
            <div className="m-card p-6 mb-6 text-left">
              <p className="m-eyebrow mb-4" style={{ fontFamily: kf }}>{t("quiz.answerReview")}</p>
              <div>
                {result.review.map((r, i) => {
                  const rq = questions.find((qq) => qq.id === r.question_id);
                  if (!rq) return null;
                  return (
                    <div
                      key={r.question_id}
                      className="flex items-start gap-3 py-3"
                      style={{
                        borderBottom:
                          i < result.review!.length - 1
                            ? "1px solid var(--hairline)"
                            : "none",
                      }}
                    >
                      <span
                        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
                        style={{
                          background: r.correct
                            ? "rgba(212, 163, 79, 0.14)"
                            : "rgba(180, 60, 60, 0.14)",
                          border: r.correct
                            ? "1px solid var(--hairline)"
                            : "1px solid rgba(180, 60, 60, 0.3)",
                          color: r.correct ? "var(--gold)" : "#C97B6E",
                        }}
                      >
                        {r.correct ? (
                          <MuseumIcon name="check" size={14} strokeWidth={2} />
                        ) : (
                          <span className="text-xs font-semibold">✕</span>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium mb-1"
                          style={{ color: "var(--ivory)", fontFamily: kf }}
                        >
                          {rq.type === "puzzle" ? t("quiz.puzzleTitle") : rq.question}
                        </p>
                        {!r.correct && !r.puzzle && rq.options && (
                          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)", fontFamily: kf }}>
                            {t("quiz.yourAnswer")}{" "}
                            <span style={{ color: "#C97B6E" }}>
                              {r.selected_index >= 0
                                ? rq.options[r.selected_index]
                                : t("quiz.notAnswered")}
                            </span>
                            {" · "}{t("quiz.correctLabel")}{" "}
                            <span style={{ color: "var(--gold)" }}>
                              {rq.options[r.correct_index]}
                            </span>
                          </p>
                        )}
                        {!r.correct && r.puzzle && (
                          <p className="text-xs leading-relaxed" style={{ color: "var(--ink-faint)", fontFamily: kf }}>
                            {t("quiz.notAnswered")}
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
            <div className="space-y-5">
              <div className="m-divider">
                <span>✦</span>
              </div>
              <p
                className="italic text-base"
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  color: "var(--ink-muted)",
                }}
              >
                &ldquo;You have to grow from the inside out. None can teach
                you.&rdquo;
              </p>
              <a
                href={`/api/quiz/certificates/${result.attempt_id}`}
                className="m-btn m-btn-primary w-full"
                style={{ minHeight: 56, fontSize: "1.05rem", fontFamily: kf }}
              >
                <MuseumIcon name="award" size={18} />
                {t("quiz.downloadCertificate")}
              </a>
            </div>
          )}

          {!result.passed && (
            <button
              onClick={() => {
                setResult(null);
                setAnswers({});
                setFeedback(null);
                setCurrentQ(0);
                setTimeLeft((quiz?.time_limit_minutes || 3) * 60);
                setPhase("quiz");
              }}
              className="m-btn m-btn-primary w-full"
              style={{ minHeight: 56, fontSize: "1.05rem", fontFamily: kf }}
            >
              {t("common.retry")}
            </button>
          )}

          <button
            onClick={() => window.location.href = '/'}
            className="m-btn m-btn-ghost mt-5"
            style={{ minHeight: 46, fontSize: "0.85rem", fontFamily: kf }}
          >
            <MuseumIcon name="arrowLeft" size={16} />
            {t("common.returnHome")}
          </button>
        </div>
      </div>
    );
  }

  // QUIZ
  if (loading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div
          className="w-12 h-12 border-2 border-transparent rounded-full animate-spin"
          style={{ borderTopColor: "var(--gold)" }}
        />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <header className="shrink-0 px-6 sm:px-8 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.confirm(t("quiz.exitConfirm"))) window.location.href = "/";
            }}
            className="m-btn m-btn-ghost touch-target"
            style={{ minHeight: 40, fontSize: "0.8rem", padding: "0 0.9rem" }}
            title={t("common.home")}
          >
            <MuseumIcon name="temple" size={15} />
          </button>
          <div>
            <p className="m-eyebrow" style={{ fontSize: "0.6rem", fontFamily: kf }}>
              {quiz?.title || t("quiz.title")}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--ink-muted)", fontFamily: kf }}>
              {t("quiz.question")} {currentQ + 1} / {questions.length}
            </p>
          </div>
        </div>

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm"
          style={{
            background: timeLeft < 30 ? "rgba(220, 60, 60, 0.1)" : "var(--card-bg)",
            color: timeLeft < 30 ? "#D96A5C" : "var(--gold)",
            border: `1px solid ${timeLeft < 30 ? "rgba(220, 60, 60, 0.3)" : "var(--hairline)"}`,
          }}
        >
          <MuseumIcon name="clock" size={15} />
          {formatTimer(timeLeft)}
        </div>

        <div className="text-sm hidden sm:block" style={{ color: "var(--ink-faint)", fontFamily: kf }}>
          {answeredCount} {t("quiz.answered")}
        </div>
      </header>

      {/* Progress bar: gold on hairline track */}
      <div
        className="shrink-0 h-[3px] mx-6 sm:mx-8 rounded-full overflow-hidden"
        style={{ background: "var(--hairline)" }}
      >
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{
            width: `${((currentQ + 1) / questions.length) * 100}%`,
            background: "linear-gradient(90deg, var(--saffron), var(--gold))",
          }}
        />
      </div>

      {/* Question */}
      <main className="flex-1 overflow-y-auto kiosk-scroll px-6 sm:px-8 py-6 w-full">
        <div className="max-w-3xl mx-auto">
          {q?.type === "puzzle" ? (
            <>
              <p className="m-eyebrow mb-2" style={{ fontFamily: kf }}>{t("quiz.puzzleTitle")}</p>
              <h2
                className="text-2xl sm:text-3xl font-semibold mb-6"
                style={{ color: "var(--ivory)", lineHeight: 1.35, fontFamily: kf }}
              >
                {t("quiz.puzzleInstructions")}
              </h2>
              <JigsawPuzzle
                key={q.id}
                imageUrl={q.image_url || "/images/vivekananda-portrait.jpg"}
                gridSize={q.gridSize || 3}
                onSolved={handlePuzzleSolved}
              />
            </>
          ) : (
            <>
              <h2
                className="text-3xl sm:text-4xl font-semibold mb-7"
                style={{ color: "var(--ivory)", lineHeight: 1.35, fontFamily: kf }}
              >
                {q?.question}
              </h2>

              <div className="space-y-3 pb-4">
                {q?.options?.map((option, i) => {
                  const selected = q && answers[q.id] === i;
                  const revealCorrect = feedback && i === feedback.correctIndex;
                  const wrongPick = selected && feedback && !feedback.correct;
                  const rightPick = selected && feedback && feedback.correct;

                  let bg: string | undefined;
                  let borderColor: string | undefined;
                  let textColor = "var(--ink-muted)";
                  if (rightPick || (revealCorrect && !wrongPick)) {
                    bg = "rgba(120, 170, 110, 0.12)";
                    borderColor = "#7FA86E";
                    textColor = "var(--ivory)";
                  } else if (wrongPick) {
                    bg = "rgba(200, 80, 70, 0.12)";
                    borderColor = "#C85046";
                    textColor = "var(--ivory)";
                  } else if (selected) {
                    bg = "rgba(224, 123, 46, 0.1)";
                    borderColor = "var(--gold)";
                    textColor = "var(--ivory)";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => selectOption(i)}
                      disabled={isAnswered || checking}
                      className="m-card w-full text-left px-5 py-4 flex items-center gap-4 text-base disabled:cursor-default"
                      style={{
                        minHeight: 60,
                        background: bg,
                        borderColor,
                        color: textColor,
                        fontWeight: 500,
                        fontFamily: kf,
                        opacity: isAnswered && !selected && !revealCorrect ? 0.55 : 1,
                        cursor: isAnswered ? "default" : "pointer",
                      }}
                    >
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold shrink-0"
                        style={{
                          background:
                            rightPick || (revealCorrect && !wrongPick)
                              ? "#7FA86E"
                              : wrongPick
                                ? "#C85046"
                                : selected
                                  ? "linear-gradient(180deg, #E8B45C, #D4A34F)"
                                  : "var(--card-bg-hover)",
                          color: selected || (revealCorrect && !wrongPick) ? "#241305" : "var(--ink-muted)",
                          border: selected || (revealCorrect && !wrongPick)
                            ? "1px solid transparent"
                            : "1px solid var(--hairline)",
                        }}
                      >
                        {rightPick || (revealCorrect && !wrongPick) ? (
                          <MuseumIcon name="check" size={16} strokeWidth={2.2} />
                        ) : wrongPick ? (
                          <span>✕</span>
                        ) : (
                          String.fromCharCode(65 + i)
                        )}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {feedback && (
                <div
                  className="mt-2 mb-4 px-5 py-4 rounded-2xl text-sm"
                  style={{
                    background: feedback.correct ? "rgba(120, 170, 110, 0.1)" : "rgba(212, 163, 79, 0.1)",
                    border: `1px solid ${feedback.correct ? "#7FA86E" : "var(--hairline-strong)"}`,
                    color: "var(--ivory)",
                    fontFamily: kf,
                  }}
                >
                  <p className="font-semibold mb-0.5">
                    {feedback.correct ? t("quiz.correctFeedback") : t("quiz.wrongFeedback")}
                  </p>
                  {!feedback.correct && (
                    <p style={{ color: "var(--ink-muted)" }}>{t("quiz.encourageMsg")}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Bottom nav — forward-only: no "previous", locked once answered */}
      <div className="shrink-0 px-6 sm:px-8 py-4">
        <div className="max-w-3xl mx-auto flex gap-4">
          <button
            onClick={goNext}
            disabled={!isAnswered || submitting}
            className="m-btn m-btn-primary flex-1 disabled:opacity-30 disabled:pointer-events-none"
            style={{ minHeight: 54, fontSize: "1rem", fontFamily: kf }}
          >
            {currentQ < questions.length - 1 ? (
              <>
                {t("quiz.nextQuestion")}
                <MuseumIcon name="arrowRight" size={17} />
              </>
            ) : (
              <>
                <MuseumIcon name="check" size={17} />
                {submitting ? t("quiz.submitting") : t("quiz.submit")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
