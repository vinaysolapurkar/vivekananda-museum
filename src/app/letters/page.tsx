"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import MuseumIcon from "@/components/MuseumIcon";
import { useLang } from "@/components/LanguageProvider";

interface Category {
  id: number;
  name: string;
  description: string;
  letter_count: number;
  child_count: number;
  kind?: string;
  cover_image_url?: string;
}

interface Letter {
  id: number;
  title: string;
  recipient: string;
  sender: string;
  place: string;
  date_label: string;
  body: string;
}

function LetterMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: "rgba(90,64,24,0.62)", fontFamily: "var(--font-body)" }}>
        {label}
      </p>
      <p className="text-sm" style={{ color: "#3E2C10", fontFamily: "var(--font-display)" }}>
        {value}
      </p>
    </div>
  );
}

export default function LettersKioskPage() {
  const { lang, t } = useLang();
  const kf = lang === "en" ? undefined : "var(--font-kannada)";
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/letters/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const logEvent = (type: string, itemId: string, itemName: string) => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: type, module: "letters", item_id: itemId, item_name: itemName }),
    }).catch(() => {});
  };

  const selectCategory = (cat: Category) => {
    logEvent("view", String(cat.id), cat.name);
    fetch(`/api/letters/categories/${cat.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.children) {
          setSelectedGroup(cat);
          setSubCategories(d.children);
        } else {
          setSelectedCat(cat);
          setLetters(d.letters || []);
          setCurrent(null);
        }
      });
  };

  const backToGroups = () => {
    setSelectedGroup(null);
    setSubCategories([]);
  };

  const backToLetterList = () => {
    setCurrent(null);
  };

  const backToCategories = () => {
    setSelectedCat(null);
    setLetters([]);
    setCurrent(null);
  };

  const openLetter = (idx: number) => {
    logEvent("letter_view", String(letters[idx].id), letters[idx].title || "Untitled");
    setCurrent(idx);
  };

  const goNext = useCallback(() => {
    setCurrent((prev) => {
      if (prev === null) return prev;
      const next = prev + 1;
      return next < letters.length ? next : prev;
    });
  }, [letters]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev === null ? prev : Math.max(0, prev - 1)));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (current === null) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") backToLetterList();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, goNext, goPrev]);

  useEffect(() => {
    let startX = 0;
    const el = containerRef.current;
    if (!el || current === null) return;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 60) { if (dx > 0) goPrev(); else goNext(); }
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => { el.removeEventListener("touchstart", onStart); el.removeEventListener("touchend", onEnd); };
  }, [current, goNext, goPrev]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-12 h-12 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: 'var(--gold)' }} />
      </div>
    );
  }

  // ─── PAPYRUS READING VIEW ───
  if (selectedCat && current !== null) {
    const letter = letters[current];
    return (
      <div ref={containerRef} className="fixed inset-0 overflow-hidden select-none" style={{ background: '#14100D' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--diya-glow)' }} />

        {/* Back / Home buttons */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 px-4 rounded-full text-xs font-medium transition-all active:scale-95 touch-target"
            style={{ background: 'rgba(13,10,8,0.72)', color: 'var(--gold)', backdropFilter: 'blur(10px)', border: '1px solid var(--hairline)' }}
            onClick={backToLetterList}>
            <MuseumIcon name="arrowLeft" size={14} />
            <span style={{ fontFamily: kf }}>{t("common.back")}</span>
          </button>
          <Link href="/"
            className="inline-flex items-center gap-2 px-4 rounded-full text-xs font-medium transition-all active:scale-95 touch-target"
            style={{ background: 'rgba(13,10,8,0.72)', color: 'var(--gold)', backdropFilter: 'blur(10px)', border: '1px solid var(--hairline)' }}>
            <MuseumIcon name="temple" size={14} />
            <span style={{ fontFamily: kf }}>{t("common.home")}</span>
          </Link>
        </div>

        <div className="absolute top-4 right-4 z-20 px-4 py-2 rounded-full flex items-baseline gap-2"
          style={{ background: 'rgba(13,10,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid var(--hairline)' }}>
          <span className="text-[10px] tracking-[0.12em]" style={{ color: 'var(--ink-faint)' }}>
            {current + 1} / {letters.length}
          </span>
        </div>

        {/* Papyrus scroll area */}
        <div className="absolute inset-0 flex items-center justify-center px-4 py-20 md:py-16 overflow-auto kiosk-scroll">
          <div
            className="relative w-full max-w-2xl animate-fade-in-up"
            style={{
              borderRadius: 4,
              boxShadow: '0 28px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(90,64,24,0.35)',
              backgroundColor: '#E8D3A0',
              backgroundImage: 'url(/images/letters/papyrus-tile.jpg)',
              backgroundRepeat: 'repeat-y',
              backgroundSize: '100% auto',
              backgroundPosition: 'top center',
            }}
          >
            {/* Worn-paper vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
              borderRadius: 4,
              boxShadow: 'inset 0 0 80px rgba(60,38,10,0.38), inset 0 0 3px rgba(60,38,10,0.5)',
              background: 'radial-gradient(ellipse 90% 50% at 50% 0%, rgba(255,247,225,0.16), transparent 55%)',
            }} />

            {/* Quill & inkwell corner ornament */}
            <img src="/images/letters/papyrus-quill-corner.png" alt="" aria-hidden="true"
              className="absolute bottom-0 right-0 pointer-events-none select-none"
              style={{
                width: '30%', maxWidth: 190, minWidth: 100, height: 'auto', opacity: 0.85,
                maskImage: 'radial-gradient(circle at 78% 78%, black 40%, transparent 72%)',
                WebkitMaskImage: 'radial-gradient(circle at 78% 78%, black 40%, transparent 72%)',
              }} />

            <div className="relative px-8 py-10 md:px-14 md:py-14">
              {/* Ornamental flourish */}
              <div className="flex items-center justify-center gap-3 mb-6" style={{ color: 'rgba(90,64,24,0.55)' }}>
                <span style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(90,64,24,0.45))' }} />
                <span style={{ fontSize: 19, fontFamily: 'var(--font-display)' }}>❧</span>
                <span style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(90,64,24,0.45))' }} />
              </div>

              {letter.title && (
                <h1 className="text-2xl md:text-3xl mb-5 text-center" style={{ fontFamily: 'var(--font-display)', color: '#3E2C10', fontStyle: 'italic' }}>
                  {letter.title}
                </h1>
              )}

              {/* Letterhead: From / To / Place / Date — only fields that are available */}
              {(letter.sender || letter.recipient || letter.place || letter.date_label) && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-7 pb-6"
                  style={{ borderBottom: '1px solid rgba(90,64,24,0.28)' }}>
                  {letter.sender && <LetterMeta label={t("letters.from")} value={letter.sender} />}
                  {letter.recipient && <LetterMeta label={t("letters.to")} value={letter.recipient} />}
                  {letter.place && <LetterMeta label={t("letters.place")} value={letter.place} />}
                  {letter.date_label && <LetterMeta label={t("letters.date")} value={letter.date_label} />}
                </div>
              )}

              <p className="whitespace-pre-wrap text-[1.05rem] md:text-[1.15rem] leading-[1.85]"
                style={{ fontFamily: 'var(--font-display)', color: '#3E2C10' }}>
                {letter.body}
              </p>

              {letter.sender && (
                <p className="text-lg mt-8 text-right italic" style={{ fontFamily: 'var(--font-display)', color: '#3E2C10' }}>
                  {letter.sender}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button onClick={goPrev} disabled={current <= 0} aria-label="Previous letter"
            className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-20 transition-all active:scale-95"
            style={{ background: 'rgba(13,10,8,0.72)', color: 'var(--gold)', border: '1px solid var(--hairline)', backdropFilter: 'blur(10px)' }}>
            <MuseumIcon name="arrowLeft" size={18} />
          </button>
          <span className="text-sm px-5 py-2.5 rounded-full italic"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-muted)', background: 'rgba(13,10,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid var(--hairline)' }}>
            {letter.title || `${t("letters.count")} ${current + 1}`}
          </span>
          <button onClick={goNext} disabled={current >= letters.length - 1} aria-label="Next letter"
            className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-20 transition-all active:scale-95"
            style={{ background: 'linear-gradient(180deg, rgba(238,138,60,0.24), rgba(217,111,36,0.24))', color: 'var(--gold)', border: '1px solid var(--hairline-strong)', backdropFilter: 'blur(10px)' }}>
            <MuseumIcon name="arrowRight" size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ─── LETTER LIST (inside a collection) ───
  if (selectedCat) {
    return (
      <div className="fixed inset-0 overflow-auto kiosk-scroll" style={{ background: 'var(--background)' }}>
        <header className="relative overflow-hidden" style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--hairline)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--diya-glow)' }} />
          <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-7 text-center">
            <button onClick={backToCategories}
              className="m-btn m-btn-ghost absolute left-6 top-1/2 -translate-y-1/2 z-20 !min-h-[42px] !px-4 text-xs">
              <MuseumIcon name="arrowLeft" size={14} />
              <span style={{ fontFamily: kf }}>{t("letters.allHeadings")}</span>
            </button>
            <Link href="/"
              className="m-btn m-btn-ghost absolute right-6 top-1/2 -translate-y-1/2 z-20 !min-h-[42px] !px-4 text-xs">
              <MuseumIcon name="temple" size={14} />
              <span style={{ fontFamily: kf }}>{t("common.home")}</span>
            </Link>
            <p className="m-eyebrow mb-2" style={{ fontFamily: kf }}>{t("mod.letters.title")}</p>
            <h1 className="font-medium leading-tight" style={{ color: 'var(--ivory)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)' }}>
              {selectedCat.name}
            </h1>
            <p className="text-sm mt-1.5" style={{ color: 'var(--ink-muted)', fontFamily: kf }}>{t("letters.selectLetter")}</p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {letters.length === 0 ? (
            <div className="text-center py-20">
              <MuseumIcon name="letter" size={48} strokeWidth={1.2} className="mx-auto mb-5" style={{ color: 'var(--ink-faint)' }} />
              <p className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--ivory)' }}>{t("letters.none")}</p>
              <p className="text-sm" style={{ color: 'var(--ink-muted)', fontFamily: kf }}>{t("letters.beingPrepared")}</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {letters.map((letter, idx) => (
                <button key={letter.id} onClick={() => openLetter(idx)}
                  className="m-card m-card-interactive text-left p-5 flex items-start gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(idx * 60, 480)}ms` }}>
                  <div className="rounded-xl flex items-center justify-center shrink-0"
                    style={{ width: 44, height: 44, background: 'rgba(212,163,79,0.1)', border: '1px solid var(--hairline)', color: 'var(--gold)' }}>
                    <MuseumIcon name="letter" size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--ivory)' }}>
                      {letter.title || (letter.recipient ? `${t("letters.to")} ${letter.recipient}` : "Untitled letter")}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
                      {[letter.place, letter.date_label].filter(Boolean).join(" · ") || " "}
                    </p>
                  </div>
                  <MuseumIcon name="arrowRight" size={16} className="shrink-0 mt-1" style={{ color: 'var(--ink-faint)' }} />
                </button>
              ))}
            </div>
          )}
          <div className="m-divider mt-10 mb-2"><span>✦</span></div>
        </div>
      </div>
    );
  }

  // ─── SHARED GRID LAYOUT (headings or sub-headings) ───
  const isSubView = !!selectedGroup;
  const displayItems = isSubView ? subCategories : categories.filter(c => Number(c.letter_count) > 0 || Number(c.child_count) > 0);
  const heading = isSubView ? selectedGroup!.name : t("mod.letters.title");
  const subHeading = isSubView ? t("letters.selectHeading") : t("letters.subHeading");

  return (
    <div className="fixed inset-0 overflow-auto kiosk-scroll" style={{ background: 'var(--background)' }}>
      <header className="relative overflow-hidden" style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--hairline)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--diya-glow)' }} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-7 text-center">
          {isSubView && (
            <button onClick={backToGroups}
              className="m-btn m-btn-ghost absolute left-6 top-1/2 -translate-y-1/2 z-20 !min-h-[42px] !px-4 text-xs">
              <MuseumIcon name="arrowLeft" size={14} />
              <span style={{ fontFamily: kf }}>{t("letters.allHeadings")}</span>
            </button>
          )}
          <Link href="/"
            className="m-btn m-btn-ghost absolute right-6 top-1/2 -translate-y-1/2 z-20 !min-h-[42px] !px-4 text-xs">
            <MuseumIcon name="temple" size={14} />
            <span style={{ fontFamily: kf }}>{t("common.home")}</span>
          </Link>
          <p className="m-eyebrow mb-2" style={{ fontFamily: kf }}>{isSubView ? t("mod.letters.title") : t("app.title")}</p>
          <h1 className="font-medium leading-tight" style={{
            color: 'var(--ivory)',
            fontSize: isSubView ? 'clamp(1.5rem, 4vw, 2.2rem)' : 'clamp(1.9rem, 5vw, 2.8rem)',
            fontFamily: !isSubView && lang !== "en" ? 'var(--font-kannada)' : undefined,
          }}>
            {heading}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--ink-muted)', fontFamily: kf }}>{subHeading}</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((cat, idx) => {
            const isGroup = cat.kind ? cat.kind === "group" : Number(cat.child_count) > 0;
            const count = isGroup ? Number(cat.child_count) : Number(cat.letter_count);
            const label = isGroup ? `${count} ${t("letters.headingsCount")}` : `${count} ${t("letters.count")}`;
            const showDesc = cat.description && cat.description.trim() !== cat.name.trim();
            return (
              <button key={cat.id} onClick={() => selectCategory(cat)}
                className="m-card m-card-interactive text-left overflow-hidden flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${Math.min(idx * 60, 480)}ms`, cursor: 'pointer' }}>
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 9', background: 'var(--bg-raised)' }}>
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: isGroup
                        ? 'linear-gradient(150deg, rgba(212,163,79,0.14), rgba(212,163,79,0.03))'
                        : 'linear-gradient(150deg, rgba(244,228,194,0.14), rgba(234,213,165,0.04))',
                    }}>
                    <MuseumIcon name={isGroup ? "scroll" : "letter"} size={48} strokeWidth={1.1}
                      style={{ color: 'var(--ink-faint)', opacity: 0.55 }} />
                  </div>
                  {cat.cover_image_url && (
                    <div className="absolute inset-0">
                      <img src={cat.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: 'saturate(0.92)' }} loading="lazy"
                        onError={(e) => { const wrap = e.currentTarget.parentElement; if (wrap) wrap.style.display = 'none'; }} />
                      <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to top, rgba(20,16,13,0.72) 0%, rgba(20,16,13,0.12) 45%, rgba(20,16,13,0.05) 100%)',
                      }} />
                    </div>
                  )}
                </div>
                <div className="px-5 pt-4 pb-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold leading-snug" style={{ color: 'var(--ivory)' }}>{cat.name}</h3>
                  {showDesc && <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--ink-muted)' }}>{cat.description}</p>}
                  <div className="flex items-center gap-1.5 mt-3 text-xs font-medium" style={{ color: 'var(--gold)' }}>
                    <MuseumIcon name={isGroup ? "scroll" : "letter"} size={14} />
                    <span style={{ fontFamily: kf }}>{label}</span>
                    <MuseumIcon name="arrowRight" size={13} className="ml-auto" style={{ color: 'var(--ink-faint)' }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {displayItems.length === 0 && (
          <div className="text-center py-20">
            <MuseumIcon name="letter" size={48} strokeWidth={1.2} className="mx-auto mb-5" style={{ color: 'var(--ink-faint)' }} />
            <p className="text-2xl mb-1" style={{ fontFamily: lang === "en" ? 'var(--font-display)' : 'var(--font-kannada)', color: 'var(--ivory)' }}>{t("letters.none")}</p>
            <p className="text-sm" style={{ color: 'var(--ink-muted)', fontFamily: kf }}>{t("letters.beingPrepared")}</p>
          </div>
        )}

        <div className="m-divider mt-10 mb-2"><span>✦</span></div>
      </div>
    </div>
  );
}
