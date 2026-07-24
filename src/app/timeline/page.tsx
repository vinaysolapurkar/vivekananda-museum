"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import MuseumIcon from "@/components/MuseumIcon";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/components/LanguageProvider";
import { MILESTONES, PHASES, PHASE_COLOR } from "@/lib/timeline-data";

// Hex → rgba helper for phase-tinted glows/washes.
function tint(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const kannadaFont = { fontFamily: "var(--font-kannada)" } as const;

export default function TimelinePage() {
  const { lang, t } = useLang();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [animKey, setAnimKey] = useState(0);

  const railRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const total = MILESTONES.length;
  const current = MILESTONES[index];
  const phaseColor = PHASE_COLOR[current.phase] ?? "var(--gold)";
  const isEn = lang === "en";
  const nonEnStyle = isEn ? undefined : kannadaFont;

  const go = useCallback(
    (next: number) => {
      setIndex((prev) => {
        const clamped = Math.max(0, Math.min(total - 1, next));
        if (clamped === prev) return prev;
        setDir(clamped > prev ? 1 : -1);
        setAnimKey((k) => k + 1);
        return clamped;
      });
    },
    [total],
  );

  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Keep the active rail marker in view
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const node = rail.querySelector<HTMLElement>(`[data-idx="${index}"]`);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [index]);

  // Swipe on the stage
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const activePhase = PHASES.find((p) => p.id === current.phase);
  const progress = ((index + 1) / total) * 100;

  return (
    <div
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Hero wash + diya glow, tinted by the active phase */}
      <div
        className="absolute inset-x-0 top-0 h-[520px] pointer-events-none"
        style={{ background: "var(--bg-hero)" }}
      />
      <div
        key={`glow-${current.phase}`}
        className="absolute inset-x-0 top-0 h-[560px] pointer-events-none transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse 62% 48% at 50% 8%, ${tint(phaseColor, 0.16)}, transparent 68%)`,
        }}
      />

      {/* ── Header band ─────────────────────────────── */}
      <header className="relative z-20 px-5 sm:px-10 pt-5 sm:pt-6 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="m-btn m-btn-ghost touch-target"
          style={{ minHeight: 44, fontSize: "0.85rem" }}
        >
          <MuseumIcon name="arrowLeft" size={16} />
          <span style={nonEnStyle}>{t("common.home")}</span>
        </Link>

        <div className="hidden sm:flex flex-col items-center text-center leading-tight">
          <p className="m-eyebrow" style={nonEnStyle}>
            {t("mod.timeline.sub")}
          </p>
          <h1
            className="text-2xl sm:text-3xl font-semibold"
            style={{ color: "var(--ivory)", ...nonEnStyle }}
          >
            {t("mod.timeline.title")}
          </h1>
        </div>

        <LanguageSwitcher size="sm" />
      </header>

      {/* Mobile title */}
      <div className="sm:hidden relative z-20 px-5 pt-4 text-center">
        <p className="m-eyebrow" style={nonEnStyle}>{t("mod.timeline.sub")}</p>
        <h1 className="text-3xl font-semibold" style={{ color: "var(--ivory)", ...nonEnStyle }}>
          {t("mod.timeline.title")}
        </h1>
      </div>

      {/* ── Phase legend ────────────────────────────── */}
      <div className="relative z-20 mt-4 sm:mt-3 px-5 sm:px-10">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {PHASES.map((p) => {
            const on = p.id === current.phase;
            return (
              <div key={p.id} className="flex items-center gap-1.5" style={{ opacity: on ? 1 : 0.5 }}>
                <span
                  className="inline-block rounded-full transition-all duration-300"
                  style={{
                    width: on ? 11 : 8,
                    height: on ? 11 : 8,
                    background: p.color,
                    boxShadow: on ? `0 0 10px ${tint(p.color, 0.8)}` : "none",
                  }}
                />
                <span
                  className="text-[0.7rem] sm:text-xs"
                  style={{ color: on ? "var(--ivory)" : "var(--ink-faint)", fontWeight: on ? 600 : 500, ...nonEnStyle }}
                >
                  {p.name[lang]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Central stage ───────────────────────────── */}
      <main
        className="flex-1 relative z-10 flex items-center justify-center px-4 sm:px-8"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Prev arrow (desktop, flanking) */}
        <button
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous"
          className="hidden md:flex items-center justify-center rounded-full touch-target shrink-0 transition-all"
          style={{
            width: 60, height: 60,
            color: index === 0 ? "var(--ink-faint)" : "var(--gold)",
            background: "var(--card-bg)",
            border: "1px solid var(--hairline)",
            opacity: index === 0 ? 0.35 : 1,
            cursor: index === 0 ? "default" : "pointer",
          }}
        >
          <MuseumIcon name="arrowLeft" size={26} />
        </button>

        <div className="w-full max-w-3xl mx-auto px-1 sm:px-8 py-6 sm:py-8">
          <div key={animKey} className="stage-anim" style={{ ["--dir" as string]: String(dir) }}>
            {/* phase tag */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider"
                style={{
                  color: phaseColor,
                  background: tint(phaseColor, 0.12),
                  border: `1px solid ${tint(phaseColor, 0.4)}`,
                  letterSpacing: "0.12em",
                }}
              >
                <MuseumIcon name="lotus" size={14} />
                <span style={nonEnStyle}>{activePhase?.name[lang]}</span>
              </span>
            </div>

            {/* big year */}
            <div className="text-center">
              <div
                className="leading-none select-none"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "clamp(4.5rem, 16vw, 9rem)",
                  color: "var(--gold)",
                  letterSpacing: "0.01em",
                  textShadow: `0 0 60px ${tint(phaseColor, 0.35)}`,
                }}
              >
                {current.year}
              </div>
              {current.date && (
                <p
                  className="mt-1 text-sm sm:text-base"
                  style={{ color: "var(--ink-muted)", ...nonEnStyle }}
                >
                  {current.date[lang]}
                </p>
              )}
            </div>

            {/* accent rule */}
            <div className="flex items-center justify-center my-5 sm:my-6">
              <span style={{ width: 60, height: 3, borderRadius: 3, background: phaseColor, boxShadow: `0 0 14px ${tint(phaseColor, 0.6)}` }} />
            </div>

            {/* title */}
            <h2
              className="text-center font-semibold px-2"
              style={{
                color: "var(--ivory)",
                fontSize: "clamp(1.7rem, 5.5vw, 2.9rem)",
                lineHeight: 1.15,
                ...nonEnStyle,
              }}
            >
              {current.title[lang]}
            </h2>

            {/* location */}
            {current.location && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <MuseumIcon name="temple" size={15} style={{ color: phaseColor }} />
                <span className="text-sm" style={{ color: "var(--ink-muted)", ...nonEnStyle }}>
                  {current.location[lang]}
                </span>
              </div>
            )}

            {/* blurb */}
            <p
              className="text-center mx-auto mt-5 sm:mt-6"
              style={{
                color: "var(--foreground)",
                opacity: 0.9,
                maxWidth: "44rem",
                fontSize: isEn ? "clamp(1rem, 2.6vw, 1.22rem)" : "clamp(0.98rem, 2.6vw, 1.18rem)",
                lineHeight: 1.7,
                ...nonEnStyle,
              }}
            >
              {current.blurb[lang]}
            </p>
          </div>
        </div>

        {/* Next arrow (desktop, flanking) */}
        <button
          onClick={next}
          disabled={index === total - 1}
          aria-label="Next"
          className="hidden md:flex items-center justify-center rounded-full touch-target shrink-0 transition-all"
          style={{
            width: 60, height: 60,
            color: index === total - 1 ? "var(--ink-faint)" : "var(--gold)",
            background: "var(--card-bg)",
            border: "1px solid var(--hairline)",
            opacity: index === total - 1 ? 0.35 : 1,
            cursor: index === total - 1 ? "default" : "pointer",
          }}
        >
          <MuseumIcon name="arrowRight" size={26} />
        </button>
      </main>

      {/* ── Bottom control block ────────────────────── */}
      <div className="relative z-20 px-4 sm:px-8 pb-6 sm:pb-8">
        {/* progress bar */}
        <div className="max-w-3xl mx-auto mb-4">
          <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "var(--hairline)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${tint(phaseColor, 0.5)}, ${phaseColor})` }}
            />
          </div>
        </div>

        {/* year rail */}
        <div
          ref={railRef}
          className="kiosk-scroll flex items-end gap-1 overflow-x-auto pb-2 px-2 mx-auto"
          style={{ maxWidth: "60rem", scrollPadding: "0 40%" }}
        >
          {MILESTONES.map((m, i) => {
            const c = PHASE_COLOR[m.phase] ?? "var(--gold)";
            const on = i === index;
            return (
              <button
                key={i}
                data-idx={i}
                onClick={() => go(i)}
                aria-label={`${m.year} — ${m.title[lang]}`}
                aria-current={on ? "true" : undefined}
                className="group flex flex-col items-center shrink-0 touch-target transition-all"
                style={{ minWidth: 52, padding: "6px 2px" }}
              >
                <span
                  className="text-[0.72rem] mb-2 transition-all whitespace-nowrap"
                  style={{
                    color: on ? "var(--ivory)" : "var(--ink-faint)",
                    fontWeight: on ? 700 : 500,
                    transform: on ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  {m.year}
                </span>
                <span
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: on ? 16 : 10,
                    height: on ? 16 : 10,
                    background: on ? c : tint(c, 0.55),
                    border: on ? `2px solid ${tint(c, 0.9)}` : "2px solid transparent",
                    boxShadow: on ? `0 0 0 4px ${tint(c, 0.18)}, 0 0 14px ${tint(c, 0.7)}` : "none",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Mobile prev/next + counter */}
        <div className="flex items-center justify-center gap-3 mt-4 md:hidden">
          <button
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous"
            className="flex items-center justify-center rounded-full touch-target"
            style={{
              width: 56, height: 56,
              color: index === 0 ? "var(--ink-faint)" : "var(--gold)",
              background: "var(--card-bg)", border: "1px solid var(--hairline)",
              opacity: index === 0 ? 0.35 : 1,
            }}
          >
            <MuseumIcon name="arrowLeft" size={24} />
          </button>
          <span
            className="text-sm tabular-nums px-3"
            style={{ color: "var(--ink-muted)", minWidth: 72, textAlign: "center" }}
          >
            {index + 1} / {total}
          </span>
          <button
            onClick={next}
            disabled={index === total - 1}
            aria-label="Next"
            className="flex items-center justify-center rounded-full touch-target"
            style={{
              width: 56, height: 56,
              color: index === total - 1 ? "var(--ink-faint)" : "#241305",
              background: index === total - 1 ? "var(--card-bg)" : "linear-gradient(180deg, #EE8A3C, #D96F24)",
              border: "1px solid var(--hairline)",
              opacity: index === total - 1 ? 0.35 : 1,
              boxShadow: index === total - 1 ? "none" : "0 4px 18px rgba(224,123,46,0.3)",
            }}
          >
            <MuseumIcon name="arrowRight" size={24} />
          </button>
        </div>

        {/* Desktop counter */}
        <p
          className="hidden md:block text-center text-sm mt-3 tabular-nums"
          style={{ color: "var(--ink-faint)" }}
        >
          {index + 1} / {total}
        </p>
      </div>

      <style>{`
        .stage-anim {
          animation: stageIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes stageIn {
          from { opacity: 0; transform: translateX(calc(var(--dir, 1) * 34px)); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .stage-anim { animation-duration: 0.01ms; }
        }
      `}</style>
    </div>
  );
}
