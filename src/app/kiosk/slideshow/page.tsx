"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MuseumIcon from "@/components/MuseumIcon";

interface Category {
  id: number;
  name: string;
  description: string;
  image_count: number;
  child_count: number;
  cover_image_url?: string;
  kind?: string;
  cover?: string | null;
}

interface SlideImage {
  id: number;
  title: string;
  description: string;
  image_url: string;
  duration_seconds: number;
  station_number: number | null;
  crop_bottom: number;
}

export default function KioskSlideshowPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [images, setImages] = useState<SlideImage[]>([]);
  const [covers, setCovers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/slideshow/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build category → first-image cover map (visual only)
  useEffect(() => {
    fetch("/api/slideshow")
      .then((r) => r.json())
      .then((d) => {
        const map: Record<number, string> = {};
        for (const img of d.images || []) {
          if (img.category_id != null && img.image_url && map[img.category_id] === undefined) {
            map[img.category_id] = img.image_url;
          }
        }
        setCovers(map);
      })
      .catch(() => {});
  }, []);

  const logEvent = (type: string, itemId: string, itemName: string) => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: type, module: "slideshow", item_id: itemId, item_name: itemName }),
    }).catch(() => {});
  };

  const selectCategory = (cat: Category) => {
    logEvent("view", String(cat.id), cat.name);
    fetch(`/api/slideshow/categories/${cat.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.children) {
          // Group category — show sub-categories
          setSelectedGroup(cat);
          setSubCategories(d.children);
        } else {
          // Leaf category — show slideshow
          setSelectedCat(cat);
          setImages(d.images || []);
          setCurrent(0);
        }
      });
  };

  const backToGroups = () => {
    setSelectedGroup(null);
    setSubCategories([]);
  };

  const backToSubCategories = () => {
    setSelectedCat(null);
    setImages([]);
    setCurrent(0);
  };

  useEffect(() => {
    if (!selectedCat || images.length <= 1) return;
    const slide = images[current];
    const dur = (slide?.duration_seconds || 5) * 1000;
    timerRef.current = setTimeout(() => { goNext(); }, dur);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [selectedCat, images, current]);

  const goNext = useCallback(() => {
    if (images.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent((prev) => {
      const next = prev + 1;
      if (next >= images.length) {
        backToSubCategories();
        return 0;
      }
      return next;
    });
  }, [images]);

  const goPrev = useCallback(() => {
    if (images.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent((prev) => Math.max(0, prev - 1));
  }, [images]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") {
        if (selectedCat) backToSubCategories();
        else if (selectedGroup) backToGroups();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, selectedCat, selectedGroup]);

  useEffect(() => {
    let startX = 0;
    const el = containerRef.current;
    if (!el) return;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 60) {
        if (timerRef.current) clearTimeout(timerRef.current);
        dx > 0 ? goPrev() : goNext();
      }
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => { el.removeEventListener("touchstart", onStart); el.removeEventListener("touchend", onEnd); };
  }, [goNext, goPrev]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="w-12 h-12 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: 'var(--gold)' }} />
      </div>
    );
  }

  // ─── SLIDESHOW VIEW ───
  if (selectedCat) {
    const slide = images[current];
    const progress = images.length > 0 ? ((current + 1) / images.length) * 100 : 0;
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 overflow-hidden select-none"
        style={{ background: '#0D0A08' }}
      >
        {slide?.image_url && (
          <img
            key={`slide-${current}-${slide.id}`}
            src={slide.image_url}
            alt={slide.title || `Slide ${current + 1}`}
            style={{
              position: 'absolute', inset: 0, display: 'block',
              width: '100vw', height: '100vh',
              objectFit: 'contain', objectPosition: 'center center',
            }}
          />
        )}

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] z-20" style={{ background: 'rgba(212,163,79,0.1)' }}>
          <div className="h-full transition-all duration-700 ease-linear"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--saffron), var(--gold))' }} />
        </div>

        {/* Back button */}
        <button
          className="absolute top-4 left-4 z-20 inline-flex items-center gap-2 px-4 rounded-full text-xs font-medium transition-all active:scale-95 touch-target"
          style={{
            background: 'rgba(13,10,8,0.72)', color: 'var(--gold)',
            backdropFilter: 'blur(10px)', border: '1px solid var(--hairline)',
          }}
          onClick={(e) => { e.stopPropagation(); backToSubCategories(); }}>
          <MuseumIcon name="arrowLeft" size={14} />
          Back
        </button>

        {/* Category caption */}
        <div className="absolute top-4 right-4 z-20 px-4 py-2 rounded-full flex items-baseline gap-2"
          style={{ background: 'rgba(13,10,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid var(--hairline)' }}>
          <span className="text-sm italic" style={{ fontFamily: 'var(--font-display)', color: 'var(--ivory)' }}>
            {selectedCat.name}
          </span>
          <span className="text-[10px] tracking-[0.12em]" style={{ color: 'var(--ink-faint)' }}>
            {current + 1} / {images.length}
          </span>
        </div>

        {/* Navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button onClick={(e) => { e.stopPropagation(); goPrev(); }} disabled={current <= 0}
            aria-label="Previous slide"
            className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-20 transition-all active:scale-95"
            style={{
              background: 'rgba(13,10,8,0.72)', color: 'var(--gold)',
              border: '1px solid var(--hairline)', backdropFilter: 'blur(10px)',
            }}>
            <MuseumIcon name="arrowLeft" size={18} />
          </button>

          {/* Progress dots (compact sets) or counter */}
          {images.length <= 12 ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-full"
              style={{ background: 'rgba(13,10,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid var(--hairline)' }}>
              {images.map((_, i) => (
                <span key={i} className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 18 : 6, height: 6,
                    background: i === current ? 'var(--gold)' : 'rgba(212,163,79,0.28)',
                  }} />
              ))}
            </div>
          ) : (
            <span className="text-sm px-5 py-2.5 rounded-full italic"
              style={{
                fontFamily: 'var(--font-display)', color: 'var(--ink-muted)',
                background: 'rgba(13,10,8,0.72)', backdropFilter: 'blur(10px)', border: '1px solid var(--hairline)',
              }}>
              {current + 1} of {images.length}
            </span>
          )}

          <button onClick={(e) => { e.stopPropagation(); goNext(); }} disabled={current >= images.length - 1}
            aria-label="Next slide"
            className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-20 transition-all active:scale-95"
            style={{
              background: 'linear-gradient(180deg, rgba(238,138,60,0.24), rgba(217,111,36,0.24))',
              color: 'var(--gold)', border: '1px solid var(--hairline-strong)', backdropFilter: 'blur(10px)',
            }}>
            <MuseumIcon name="arrowRight" size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ─── SHARED GRID LAYOUT (categories or sub-categories) ───
  const isSubView = !!selectedGroup;
  const displayItems = isSubView ? subCategories : categories.filter(c => Number(c.image_count) > 0 || Number(c.child_count) > 0);
  const heading = isSubView ? selectedGroup!.name : "Exhibit Gallery";
  const subHeading = isSubView ? "Select a lecture to begin" : "A visual journey through Swamiji's life and teachings";

  return (
    <div className="fixed inset-0 overflow-auto kiosk-scroll" style={{ background: 'var(--background)' }}>

      {/* Header band */}
      <header className="relative overflow-hidden" style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--hairline)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--diya-glow)' }} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-7 text-center">
          {isSubView && (
            <button
              onClick={backToGroups}
              className="m-btn m-btn-ghost absolute left-6 top-1/2 -translate-y-1/2 z-20 !min-h-[42px] !px-4 text-xs">
              <MuseumIcon name="arrowLeft" size={14} />
              All Topics
            </button>
          )}
          <p className="m-eyebrow mb-2">{isSubView ? "Exhibit Gallery" : "Viveka Smaraka"}</p>
          <h1 className="font-medium leading-tight" style={{
            color: 'var(--ivory)',
            fontSize: isSubView ? 'clamp(1.5rem, 4vw, 2.2rem)' : 'clamp(1.9rem, 5vw, 2.8rem)',
          }}>
            {heading}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--ink-muted)' }}>{subHeading}</p>
        </div>
      </header>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((cat, idx) => {
            const isGroup = cat.kind ? cat.kind === "group" : Number(cat.child_count) > 0;
            const count = isGroup ? Number(cat.child_count) : Number(cat.image_count);
            const label = isGroup ? `${count} lectures` : `${count} slides`;
            const cover = cat.cover || cat.cover_image_url || covers[cat.id] || "";
            const showDesc = cat.description && cat.description.trim() !== cat.name.trim();
            return (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat as Category)}
                className="m-card m-card-interactive text-left overflow-hidden flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${Math.min(idx * 60, 480)}ms`, cursor: 'pointer' }}>
                {/* Cover */}
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 10', background: 'var(--bg-raised)' }}>
                  {/* Elegant fallback (always underneath) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MuseumIcon name={isGroup ? "scroll" : "gallery"} size={56} strokeWidth={1.1}
                      style={{ color: 'var(--ink-faint)', opacity: 0.45 }} />
                  </div>
                  {cover && (
                    <div className="absolute inset-0">
                      <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: 'saturate(0.92)' }} loading="lazy"
                        onError={(e) => { const wrap = e.currentTarget.parentElement; if (wrap) wrap.style.display = 'none'; }} />
                      <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to top, rgba(20,16,13,0.72) 0%, rgba(20,16,13,0.12) 45%, rgba(20,16,13,0.05) 100%)',
                      }} />
                    </div>
                  )}
                </div>
                {/* Meta */}
                <div className="px-5 pt-4 pb-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold leading-snug" style={{ color: 'var(--ivory)' }}>
                    {cat.name}
                  </h3>
                  {showDesc && (
                    <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--ink-muted)' }}>{cat.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-3 text-xs font-medium" style={{ color: 'var(--gold)' }}>
                    <MuseumIcon name={isGroup ? "scroll" : "gallery"} size={14} />
                    <span>{label}</span>
                    <MuseumIcon name="arrowRight" size={13} className="ml-auto" style={{ color: 'var(--ink-faint)' }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {displayItems.length === 0 && (
          <div className="text-center py-20">
            <MuseumIcon name="gallery" size={48} strokeWidth={1.2} className="mx-auto mb-5" style={{ color: 'var(--ink-faint)' }} />
            <p className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--ivory)' }}>No exhibits available yet</p>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>Content is being prepared</p>
          </div>
        )}

        <div className="m-divider mt-10 mb-2"><span>✦</span></div>
      </div>
    </div>
  );
}
