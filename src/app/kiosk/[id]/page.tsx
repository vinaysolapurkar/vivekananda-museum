"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { use } from "react";
import Link from "next/link";

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
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastTouch, setLastTouch] = useState(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lang = "en"; // Kiosk default

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kiosk/${id}/slides?lang=${lang}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSlides(data.slides || []);
    } catch {
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [id, lang]);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  // Auto-advance slides
  useEffect(() => {
    if (slides.length === 0) return;
    const slide = slides[current];
    const duration = (slide?.duration_seconds || 15) * 1000;
    
    timerRef.current = setInterval(() => {
      setCurrent(prev => {
        const next = prev + 1;
        return next >= slides.length ? 0 : next;
      });
    }, duration);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides, current]);

  // Reset timer on manual navigation
  const resetTimer = useCallback(() => {
    setLastTouch(Date.now());
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Swipe/click navigation
  const goNext = useCallback(() => {
    resetTimer();
    setCurrent(prev => (prev + 1) % slides.length);
  }, [slides.length, resetTimer]);

  const goPrev = useCallback(() => {
    resetTimer();
    setCurrent(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length, resetTimer]);

  // Auto-return to home after 120s of no interaction
  useEffect(() => {
    const idleTimer = setInterval(() => {
      if (Date.now() - lastTouch > 120000) {
        // Would redirect to home in production
        // window.location.href = '/';
      }
    }, 30000);
    return () => clearInterval(idleTimer);
  }, [lastTouch]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      resetTimer();
      if (e.key === 'ArrowRight' || e.key === ' ') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, resetTimer]);

  // Touch swipe
  useEffect(() => {
    let startX = 0;
    const el = containerRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; resetTimer(); };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 60) { dx > 0 ? goPrev() : goNext(); }
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [goNext, goPrev, resetTimer]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#1A237E' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6 mx-auto" />
          <p className="text-white/70 text-xl font-light">Loading exhibit...</p>
        </div>
      </div>
    );
  }

  if (error || slides.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#1A237E' }}>
        <div className="text-center px-8">
          <div className="text-6xl mb-6">🖼️</div>
          <h2 className="text-white text-3xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Content Coming Soon
          </h2>
          <p className="text-white/60 text-lg">This exhibit is being prepared.</p>
        </div>
      </div>
    );
  }

  const slide = slides[current];
  const progress = slides.length > 1 ? ((current + 1) / slides.length) * 100 : 100;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden select-none cursor-none"
      style={{ background: '#0D1447' }}
      onClick={goNext}
      onTouchStart={() => { resetTimer(); }}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, #283593 0%, #1A237E 50%, #0D1447 100%)',
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-lg backdrop-blur-sm">
            🖥️
          </div>
          <span className="text-white/50 text-sm font-medium">Exhibit Display</span>
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div 
                key={i}
                className="h-1 rounded-full transition-all duration-500"
                style={{ 
                  width: i === current ? '32px' : '8px',
                  background: i <= current ? '#FF8F00' : 'rgba(255,255,255,0.2)'
                }}
              />
            ))}
          </div>
          <span className="text-white/40 text-sm font-medium ml-2">
            {current + 1} / {slides.length}
          </span>
        </div>

        <div className="w-24" /> {/* Spacer to balance */}
      </div>

      {/* Main content */}
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
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {slide.title}
          </h1>
          
          <div 
            className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto"
            style={{ lineHeight: '1.7' }}
          >
            {slide.content.split('\n').map((para, i) => (
              <p key={i} className="mb-4">{para}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div 
          className="h-full rounded-r-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #FF8F00, #FF6F00)' }}
        />
      </div>

      {/* Navigation hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/30 text-sm">
        <span>← Swipe or press → to continue</span>
      </div>

      {/* Vivekananda quote watermark */}
      <div className="absolute bottom-6 right-8 text-right">
        <p 
          className="text-white/10 text-sm italic"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          "Arise, awake, and stop not till the goal is reached."
        </p>
      </div>
    </div>
  );
}
