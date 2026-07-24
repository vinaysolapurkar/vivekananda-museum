"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MuseumIcon from "@/components/MuseumIcon";
import { useLang } from "@/components/LanguageProvider";

interface Quiz {
  id: number;
  title: string;
  description?: string;
  time_limit_minutes: number;
  passing_score: number;
  is_active: number;
}

export default function QuizListPage() {
  const { lang, t } = useLang();
  const kf = lang === "en" ? undefined : "var(--font-kannada)";
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quiz")
      .then((r) => r.json())
      .then((data) =>
        setQuizzes(
          (data.quizzes || []).filter((q: Quiz) => Number(q.is_active) !== 0)
        )
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen relative"
      style={{ background: "var(--background)" }}
    >
      {/* Hero band with diya glow */}
      <div
        className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
        style={{ background: "var(--bg-hero)" }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
        style={{ background: "var(--diya-glow)" }}
      />

      {/* Top bar */}
      <header className="relative z-10 px-6 sm:px-10 pt-6 flex items-center">
        <Link
          href="/"
          className="m-btn m-btn-ghost touch-target"
          style={{ minHeight: 44, fontSize: "0.85rem" }}
        >
          <MuseumIcon name="arrowLeft" size={16} />
          <span style={{ fontFamily: kf }}>{t("common.home")}</span>
        </Link>
      </header>

      <main className="flex-1 relative z-10 flex flex-col items-center px-6 pb-16 w-full">
        {/* Hero */}
        <div className="text-center pt-8 sm:pt-12 animate-fade-in-up">
          <div
            className="mx-auto mb-6 flex items-center justify-center rounded-full"
            style={{
              width: 76,
              height: 76,
              color: "var(--gold)",
              background: "var(--card-bg)",
              border: "1px solid var(--hairline)",
              boxShadow: "0 0 44px rgba(224, 123, 46, 0.18)",
            }}
          >
            <MuseumIcon name="scroll" size={34} strokeWidth={1.4} />
          </div>

          <p className="m-eyebrow mb-3" style={{ fontFamily: kf }}>{t("quiz.testUnderstanding")}</p>
          <h1
            className="text-5xl sm:text-6xl font-semibold mb-4"
            style={{ color: "var(--ivory)", fontFamily: kf }}
          >
            {t("quiz.title")}
          </h1>
          <p
            className="text-base sm:text-lg max-w-md mx-auto leading-relaxed"
            style={{ color: "var(--ink-muted)", fontFamily: kf }}
          >
            {t("quiz.introBlurb")}
          </p>

          <div className="m-divider my-9">
            <span>✦</span>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="w-10 h-10 border-2 border-transparent rounded-full animate-spin"
              style={{ borderTopColor: "var(--gold)" }}
            />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12 animate-fade-in-up">
            <p
              className="text-2xl mb-2"
              style={{
                fontFamily: lang === "en" ? '"Cormorant Garamond", serif' : "var(--font-kannada)",
                color: "var(--ivory)",
              }}
            >
              {t("quiz.noQuizzes")}
            </p>
            <Link
              href="/admin/quiz"
              className="text-sm hover:underline"
              style={{ color: "var(--gold)", fontFamily: kf }}
            >
              {t("quiz.createInAdmin")}
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-6">
            {quizzes.map((q, idx) => (
              <Link
                key={q.id}
                href={`/quiz/${q.id}`}
                className="m-card m-card-interactive block p-8 sm:p-10 animate-fade-in-up"
                style={{ animationDelay: `${0.12 + idx * 0.08}s` }}
              >
                <div className="text-center">
                  <h2
                    className="text-3xl sm:text-4xl font-semibold mb-3"
                    style={{ color: "var(--ivory)" }}
                  >
                    {q.title}
                  </h2>
                  {q.description && (
                    <p
                      className="text-sm sm:text-base mb-1 max-w-lg mx-auto"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      {q.description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div
                    className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 mt-6 mb-7 text-sm"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <MuseumIcon
                        name="clock"
                        size={17}
                        style={{ color: "var(--gold)" }}
                      />
                      <span style={{ fontFamily: kf }}>{q.time_limit_minutes} {t("quiz.minutes")}</span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MuseumIcon
                        name="award"
                        size={17}
                        style={{ color: "var(--gold)" }}
                      />
                      <span style={{ fontFamily: kf }}>{t("quiz.earnCertificate")}</span>
                    </span>
                    <span
                      className="m-chip"
                      style={{ minHeight: 32, padding: "0 0.9rem", cursor: "inherit", fontFamily: kf }}
                    >
                      <MuseumIcon name="check" size={14} />
                      {q.passing_score}% {t("quiz.toPass")}
                    </span>
                  </div>

                  <span
                    className="m-btn m-btn-primary w-full sm:w-auto sm:min-w-[260px]"
                    style={{ minHeight: 56, fontSize: "1.05rem", fontFamily: kf }}
                  >
                    <MuseumIcon name="play" size={18} />
                    {t("quiz.startQuiz")}
                  </span>
                </div>
              </Link>
            ))}

            {/* Reassurance footer */}
            <div
              className="text-center pt-4 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <p className="text-xs" style={{ color: "var(--ink-faint)", fontFamily: kf }}>
                {t("quiz.reassurance")}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
