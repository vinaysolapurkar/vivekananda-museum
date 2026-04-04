"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SlideImage {
  id: number;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
  station_number: number | null;
}

export default function KioskSlideshowPage() {
  const [images, setImages] = useState<SlideImage[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/slideshow")
      .then((r) => r.json())
      .then((data) => setImages(data.images || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-advance every 8 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      goNext();
    }, 8000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [images.length, current]);

  const goNext = useCallback(() => {
    if (images.length === 0) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % images.length);
      setTransitioning(false);
    }, 500);
  }, [images.length]);

  const goPrev = useCallback(() => {
    if (images.length === 0) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent((prev) => (prev - 1 + images.length) % images.length);
      setTransitioning(false);
    }, 500);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // Touch swipe
  useEffect(() => {
    let startX = 0;
    const el = containerRef.current;
    if (!el) return;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 60) {
        if (timerRef.current) clearInterval(timerRef.current);
        dx > 0 ? goPrev() : goNext();
      }
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [goNext, goPrev]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white/40 text-xl">
        No slideshow images uploaded yet
      </div>
    );
  }

  const slide = images[current];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden select-none cursor-none"
    >
      {/* Image with crossfade */}
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-in-out"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        <img
          src={slide.image_url}
          alt={slide.title}
          className="w-full h-full object-contain"
          style={{ filter: "brightness(0.95)" }}
        />
      </div>

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Title and description */}
      {(slide.title || slide.description) && (
        <div 
          className="absolute bottom-20 left-8 right-8 text-white transition-opacity duration-700"
          style={{ opacity: transitioning ? 0 : 1 }}
        >
          {slide.title && (
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
              {slide.title}
            </h2>
          )}
          {slide.description && (
            <p className="text-lg text-white/70 max-w-3xl">{slide.description}</p>
          )}
        </div>
      )}

      {/* Station number badge */}
      {slide.station_number && (
        <div className="absolute top-8 left-8 bg-amber-600/80 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
          Station {slide.station_number}
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${((current + 1) / images.length) * 100}%`,
            background: "linear-gradient(90deg, #D4A34F, #E8B84B)",
          }}
        />
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 right-8 text-white/30 text-sm font-mono">
        {current + 1} / {images.length}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === current ? "24px" : "6px",
              background: i === current ? "#D4A34F" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
