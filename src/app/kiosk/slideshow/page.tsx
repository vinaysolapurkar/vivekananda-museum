"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Category {
  id: number;
  name: string;
  description: string;
  image_count: number;
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
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [images, setImages] = useState<SlideImage[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/slideshow/categories")
      .then((r) => r.json())
      .then((d) => setCategories((d.categories || []).filter((c: Category) => c.image_count > 0)))
      .catch(() => {})
      .finally(() => setLoading(false));
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
        setSelectedCat(d.category);
        setImages(d.images || []);
        setCurrent(0);
      });
  };

  useEffect(() => {
    if (!selectedCat || images.length <= 1) return;
    const slide = images[current];
    const dur = (slide?.duration_seconds || 5) * 1000;

    timerRef.current = setTimeout(() => {
      goNext();
    }, dur);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [selectedCat, images, current]);

  const goNext = useCallback(() => {
    if (images.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent((prev) => {
      const next = prev + 1;
      if (next >= images.length) {
        setSelectedCat(null);
        setImages([]);
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
      if (e.key === "Escape") { setSelectedCat(null); setImages([]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

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
      <div className="fixed inset-0 flex items-center justify-center" style={{
        background: 'linear-gradient(170deg, #1a0f0a 0%, #2a1810 30%, #1c1008 100%)',
      }}>
        <div className="w-12 h-12 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: '#D4A34F' }} />
      </div>
    );
  }

  // ─── CATEGORY SELECTION ───
  if (!selectedCat) {
    return (
      <div className="fixed inset-0 overflow-auto" style={{
        background: 'linear-gradient(170deg, #1a0f0a 0%, #2a1810 30%, #1c1008 100%)',
      }}>
        {/* Vivekananda watermark */}
        <div className="fixed top-0 right-0 bottom-0 w-[45%] pointer-events-none z-0 opacity-[0.06]" style={{
          backgroundImage: 'url(/images/vivekananda-portrait.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
          backgroundSize: 'auto 80%',
          maskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
          filter: 'sepia(0.4) brightness(1.2)',
        }} />

        {/* Header */}
        <div className="relative text-center px-8 pt-12 pb-8 overflow-hidden" style={{
          background: 'linear-gradient(170deg, #3a1a12 0%, #2a1810 100%)',
        }}>
          <div className="relative z-10">
            <img src="/images/logo.png" alt="Ramakrishna Math" className="w-20 h-20 mx-auto mb-2 object-contain" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
            <h1 className="text-4xl font-light mb-2" style={{
              fontFamily: 'Cormorant Garamond, serif', color: '#F5EDE0',
              textShadow: '0 2px 16px rgba(0,0,0,0.4)',
            }}>
              Viveka Smaraka
            </h1>
            <p className="text-sm" style={{ color: '#9B8A72' }}>
              Select a topic to explore
            </p>
          </div>
          <div className="absolute bottom-0 left-8 right-8 h-px" style={{
            background: 'linear-gradient(to right, transparent, rgba(212,163,79,0.15) 20%, rgba(212,163,79,0.15) 80%, transparent)',
          }} />
        </div>

        <div className="w-full p-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat)}
                className="text-left rounded-2xl p-6 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(255,245,230,0.04)',
                  border: '1px solid rgba(212,163,79,0.1)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                }}
              >
                <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-xl"
                  style={{ background: 'rgba(212,163,79,0.08)', color: '#D4A34F' }}>
                  🖼
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F5EDE0' }}>
                  {cat.name}
                </h3>
                <p className="text-xs" style={{ color: '#9B8A72' }}>
                  {cat.description}
                </p>
                <p className="text-xs mt-2 font-medium" style={{ color: '#D4A34F' }}>
                  {cat.image_count} slides →
                </p>
              </button>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4" style={{ border: '1.5px solid rgba(212,163,79,0.2)' }}>
                <img src="/images/vivekananda-portrait.jpg" alt="" className="w-full h-full object-cover" style={{ opacity: 0.5, filter: 'sepia(0.3)' }} />
              </div>
              <p className="text-xl mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#D9CBBA' }}>No exhibits available yet</p>
              <p className="text-sm" style={{ color: '#9B8A72' }}>Content is being prepared</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── SLIDESHOW VIEW ───
  const slide = images[current];
  const progress = images.length > 0 ? ((current + 1) / images.length) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: '#0f0806' }}
    >
      {/* ── Slide image: exact viewport fit, no overflow ── */}
      <div
        className="transition-opacity duration-500"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {slide?.image_url && (
          <img
            src={slide.image_url}
            alt={slide.title}
            style={{
              display: 'block',
              width: '100vw',
              height: '100vh',
              objectFit: 'contain',
              objectPosition: 'center center',
            }}
          />
        )}
      </div>

      {/* ── Top: thin progress bar ── */}
      <div className="absolute top-0 left-0 right-0 h-[3px] z-20" style={{ background: 'rgba(212,163,79,0.08)' }}>
        <div
          className="h-full transition-all duration-700 ease-linear"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #C8963E, #E8C06A)',
          }}
        />
      </div>

      {/* ── Top-right: category + counter pill ── */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <span
          className="px-3 py-1 rounded-full text-[11px] font-medium"
          style={{
            background: 'rgba(15,8,6,0.7)',
            color: '#C8A882',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(212,163,79,0.1)',
          }}
        >
          {selectedCat.name} &middot; {current + 1}/{images.length}
        </span>
      </div>

      {/* ── Navigation buttons — visible ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          disabled={current <= 0}
          className="px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-20 transition-all active:scale-95"
          style={{ background: 'rgba(15,8,6,0.8)', color: '#C8A882', border: '1px solid rgba(212,163,79,0.15)', backdropFilter: 'blur(10px)' }}
        >
          ← Prev
        </button>
        <span className="text-xs font-mono px-3 py-2 rounded-lg" style={{
          background: 'rgba(15,8,6,0.7)', color: '#9B8A72', backdropFilter: 'blur(10px)',
        }}>
          {current + 1} / {images.length}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          disabled={current >= images.length - 1}
          className="px-6 py-3 rounded-xl text-sm font-medium disabled:opacity-20 transition-all active:scale-95"
          style={{ background: 'rgba(212,163,79,0.15)', color: '#E8C06A', border: '1px solid rgba(212,163,79,0.25)', backdropFilter: 'blur(10px)' }}
        >
          Next →
        </button>
      </div>

      {/* ── Back button (top-left) ── */}
      <button
        className="absolute top-3 left-3 z-20 px-4 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
        style={{
          background: 'rgba(15,8,6,0.8)',
          color: '#C8A882',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(212,163,79,0.1)',
        }}
        onClick={(e) => { e.stopPropagation(); setSelectedCat(null); setImages([]); setCurrent(0); }}
      >
        ← Back to Topics
      </button>
    </div>
  );
}
