"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { use } from "react";

interface ExhibitImage {
  id: number;
  image_url: string;
  title: string;
  description: string;
  station_number: number | null;
  sort_order: number;
}

interface Exhibit {
  id: number;
  name: string;
  description: string;
}

interface Slide {
  id: number;
  slide_number: number;
  title: string;
  content: string;
  image_url: string;
  duration_seconds: number;
}

export default function KioskDisplayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [exhibit, setExhibit] = useState<Exhibit | null>(null);
  const [images, setImages] = useState<ExhibitImage[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [mode, setMode] = useState<"exhibit" | "slides">("slides");
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastTouch, setLastTouch] = useState(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const exhibitRes = await fetch("/api/exhibits");
      const exhibitData = await exhibitRes.json();
      const exhibits = exhibitData.exhibits || [];
      const kioskExhibit = exhibits.find(
        (e: { kiosk_id: number; is_active: number }) =>
          e.kiosk_id === Number(id) && e.is_active === 1
      );

      if (kioskExhibit) {
        const detailRes = await fetch(`/api/exhibits/${kioskExhibit.id}`);
        const detailData = await detailRes.json();
        if (detailData.images && detailData.images.length > 0) {
          setExhibit(detailData.exhibit);
          setImages(detailData.images);
          setMode("exhibit");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`/api/kiosk/${id}/slides?lang=en`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSlides(data.slides || []);
      setMode("slides");
    } catch {
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const items = mode === "exhibit" ? images : slides;
  const totalItems = items.length;

  // Auto-advance
  useEffect(() => {
    if (totalItems === 0) return;
    const duration = mode === "exhibit" ? 8000 : ((slides[current]?.duration_seconds || 15) * 1000);

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalItems);
    }, duration);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalItems, current, mode, slides]);

  const resetTimer = useCallback(() => {
    setLastTouch(Date.now());
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const goNext = useCallback(() => {
    resetTimer();
    setCurrent((prev) => (prev + 1) % totalItems);
  }, [totalItems, resetTimer]);

  const goPrev = useCallback(() => {
    resetTimer();
    setCurrent((prev) => (prev - 1 + totalItems) % totalItems);
  }, [totalItems, resetTimer]);

  // Idle timeout
  useEffect(() => {
    const idleTimer = setInterval(() => {
      if (Date.now() - lastTouch > 120000) {
        setCurrent(0);
        setLastTouch(Date.now());
      }
    }, 30000);
    return () => clearInterval(idleTimer);
  }, [lastTouch]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      resetTimer();
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, resetTimer]);

  // Touch swipe
  useEffect(() => {
    let startX = 0;
    const el = containerRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      resetTimer();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 60) {
        dx > 0 ? goPrev() : goNext();
      }
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [goNext, goPrev, resetTimer]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#1a0f0a" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-transparent rounded-full animate-spin mb-6 mx-auto" style={{ borderTopColor: '#D4A34F' }} />
          <p className="text-sm font-light" style={{ color: '#9B8A72' }}>Loading exhibit...</p>
        </div>
      </div>
    );
  }

  if (error || totalItems === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#1a0f0a" }}>
        <div className="text-center px-8">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#9B8A72" strokeWidth="1" className="mx-auto mb-6">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
          </svg>
          <h2
            className="text-3xl font-semibold mb-3"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}
          >
            Content Coming Soon
          </h2>
          <p className="text-base" style={{ color: '#9B8A72' }}>This exhibit is being prepared.</p>
        </div>
      </div>
    );
  }

  const progress = totalItems > 1 ? ((current + 1) / totalItems) * 100 : 100;

  // EXHIBIT IMAGE MODE
  if (mode === "exhibit") {
    const img = images[current];
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 overflow-hidden select-none cursor-none"
        style={{ background: "#0f0806" }}
        onClick={goNext}
      >
        {/* Full-screen image with Ken Burns */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            key={current}
            src={img.image_url}
            alt={img.title || exhibit?.name || "Exhibit"}
            className="max-w-full max-h-full object-contain"
            style={{
              animation: 'kenBurns 8s ease-out forwards',
            }}
            draggable={false}
          />
        </div>

        {/* Top gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to bottom, rgba(15,8,6,0.8), transparent)" }}
        />

        {/* Progress line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] z-30" style={{ background: 'rgba(212,163,79,0.08)' }}>
          <div
            className="h-full transition-all duration-1000 ease-linear"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #D4A34F, #E8C06A)',
            }}
          />
        </div>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}
            >
              {exhibit?.name}
            </h1>
            {img.title && <p className="text-sm mt-1" style={{ color: '#9B8A72' }}>{img.title}</p>}
          </div>

          {/* Slide counter */}
          <span className="text-sm font-light" style={{ color: 'rgba(155,138,114,0.5)' }}>
            {current + 1} / {totalItems}
          </span>
        </div>

        {/* Bottom info overlay */}
        {(img.description || img.station_number) && (
          <div
            className="absolute bottom-0 left-0 right-0 z-20"
            style={{ background: "linear-gradient(to top, rgba(15,8,6,0.9), transparent)" }}
          >
            <div className="px-8 pb-8 pt-16">
              {img.station_number && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                  style={{ background: 'rgba(212,163,79,0.15)', color: '#D4A34F', border: '1px solid rgba(212,163,79,0.2)' }}
                >
                  Station {img.station_number}
                </span>
              )}
              {img.description && (
                <p className="text-base leading-relaxed" style={{ color: 'rgba(217,203,186,0.85)' }}>
                  {img.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // SLIDES MODE
  const slide = slides[current];
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none cursor-none"
      style={{ background: "#1a0f0a" }}
      onClick={goNext}
    >
      {/* Ambient */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, rgba(42,24,16,0.5) 0%, rgba(26,15,10,1) 70%)'
      }} />

      {/* Progress line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-30" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="h-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #D4A34F, #E8C06A)',
          }}
        />
      </div>

      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B8A72" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span className="text-sm font-light" style={{ color: '#9B8A72' }}>
            Exhibit Display
          </span>
        </div>
        <span className="text-sm font-light" style={{ color: 'rgba(155,138,114,0.5)' }}>
          {current + 1} / {slides.length}
        </span>
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-12 py-20">
        {slide.image_url && (
          <div className="mb-8 max-h-[40vh]">
            <img
              src={slide.image_url}
              alt={slide.title}
              className="max-h-[40vh] max-w-full object-contain rounded-xl"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            />
          </div>
        )}
        <div className="text-center w-full">
          <h1
            className="text-4xl md:text-6xl font-semibold mb-6 leading-tight"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}
          >
            {slide.title}
          </h1>
          <div className="text-lg md:text-xl w-full" style={{ color: 'rgba(217,203,186,0.8)', lineHeight: '1.8' }}>
            {slide.content.split("\n").map((para, i) => (
              <p key={i} className="mb-4">{para}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs" style={{ color: 'rgba(155,138,114,0.25)' }}>
        <span>&larr; Swipe or press &rarr; to continue</span>
      </div>

      <div className="absolute bottom-6 right-8 text-right">
        <p
          className="text-xs italic"
          style={{ fontFamily: '"Cormorant Garamond", serif', color: 'rgba(212,163,79,0.12)' }}
        >
          &ldquo;Arise, awake, and stop not till the goal is reached.&rdquo;
        </p>
      </div>
    </div>
  );
}
