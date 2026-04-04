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
      // Try to find an exhibit assigned to this kiosk
      const exhibitRes = await fetch("/api/exhibits");
      const exhibitData = await exhibitRes.json();
      const exhibits = exhibitData.exhibits || [];
      const kioskExhibit = exhibits.find(
        (e: { kiosk_id: number; is_active: number }) =>
          e.kiosk_id === Number(id) && e.is_active === 1
      );

      if (kioskExhibit) {
        // Load exhibit images
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

      // Fall back to slides
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
        // Reset to first slide on idle
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
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "#1A237E" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6 mx-auto" />
          <p className="text-white/70 text-xl font-light">Loading exhibit...</p>
        </div>
      </div>
    );
  }

  if (error || totalItems === 0) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "#1A237E" }}
      >
        <div className="text-center px-8">
          <div className="text-6xl mb-6">🖼️</div>
          <h2
            className="text-white text-3xl font-bold mb-3"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Content Coming Soon
          </h2>
          <p className="text-white/60 text-lg">This exhibit is being prepared.</p>
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
        style={{ background: "#0a0a0a" }}
        onClick={goNext}
      >
        {/* Full-screen image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={img.image_url}
            alt={img.title || exhibit?.name || "Exhibit"}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>

        {/* Gradient overlay at top */}
        <div
          className="absolute top-0 left-0 right-0 h-32"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
          }}
        />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
          <div>
            <h1
              className="text-white text-xl font-bold"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {exhibit?.name}
            </h1>
            {img.title && <p className="text-white/60 text-sm mt-1">{img.title}</p>}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              {images.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: i === current ? "32px" : "8px",
                    background:
                      i <= current ? "#FF8F00" : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
            <span className="text-white/40 text-sm font-medium">
              {current + 1} / {totalItems}
            </span>
          </div>
        </div>

        {/* Bottom info overlay */}
        {(img.description || img.station_number) && (
          <div
            className="absolute bottom-0 left-0 right-0 z-20"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
            }}
          >
            <div className="px-8 pb-8 pt-16">
              {img.station_number && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-2"
                  style={{ background: "#FF8F00" }}>
                  Station {img.station_number}
                </span>
              )}
              {img.description && (
                <p className="text-white/80 text-lg max-w-3xl leading-relaxed">
                  {img.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
          <div
            className="h-full rounded-r-full transition-all duration-1000 ease-linear"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #FF8F00, #FF6F00)",
            }}
          />
        </div>
      </div>
    );
  }

  // SLIDES MODE (fallback)
  const slide = slides[current];
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none cursor-none"
      style={{ background: "#0D1447" }}
      onClick={goNext}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, #283593 0%, #1A237E 50%, #0D1447 100%)",
        }}
      />

      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-lg backdrop-blur-sm">
            🖥️
          </div>
          <span className="text-white/50 text-sm font-medium">
            Exhibit Display
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === current ? "32px" : "8px",
                  background:
                    i <= current ? "#FF8F00" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
          <span className="text-white/40 text-sm font-medium ml-2">
            {current + 1} / {slides.length}
          </span>
        </div>
        <div className="w-24" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-12 py-20">
        {slide.image_url && (
          <div className="mb-8 max-h-[40vh]">
            <img
              src={slide.image_url}
              alt={slide.title}
              className="max-h-[40vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}
        <div className="text-center max-w-4xl">
          <h1
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {slide.title}
          </h1>
          <div
            className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto"
            style={{ lineHeight: "1.7" }}
          >
            {slide.content.split("\n").map((para, i) => (
              <p key={i} className="mb-4">
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full rounded-r-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #FF8F00, #FF6F00)",
          }}
        />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/30 text-sm">
        <span>← Swipe or press → to continue</span>
      </div>

      <div className="absolute bottom-6 right-8 text-right">
        <p
          className="text-white/10 text-sm italic"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          &ldquo;Arise, awake, and stop not till the goal is reached.&rdquo;
        </p>
      </div>
    </div>
  );
}
