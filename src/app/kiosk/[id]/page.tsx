"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { use } from "react";

type Lang = "en" | "kn" | "hi";

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
  const [lang, setLang] = useState<Lang>("en");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSlides = useCallback(() => {
    setLoading(true);
    fetch(`/api/kiosk/${id}/slides?lang=${lang}`)
      .then((r) => r.json())
      .then((data) => {
        setSlides(data.slides || []);
        setCurrent(0);
      })
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }, [id, lang]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const slide = slides[current];
    if (!slide) return;
    autoTimer.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, (slide.duration_seconds || 10) * 1000);
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
    };
  }, [current, slides]);

  // Inactivity reset
  const resetInactivity = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setCurrent(0);
    }, 60000);
  }, []);

  useEffect(() => {
    const events = ["touchstart", "mousedown", "mousemove", "keydown"];
    events.forEach((e) => document.addEventListener(e, resetInactivity));
    resetInactivity();
    return () => {
      events.forEach((e) => document.removeEventListener(e, resetInactivity));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivity]);

  const goTo = (index: number) => {
    setCurrent(index);
    resetInactivity();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-dark text-text-light">
        <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-surface-dark text-text-light text-center p-8">
        <h1 className="text-3xl font-heading mb-4">No slides available</h1>
        <p className="text-text-light/60">Configure slides in the admin panel</p>
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-surface-dark text-text-light flex flex-col kiosk-scroll"
      onTouchStart={resetInactivity}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-primary/80 backdrop-blur-sm">
        <div className="flex gap-2">
          {(["en", "kn", "hi"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                lang === l
                  ? "bg-saffron text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {l === "en" ? "English" : l === "kn" ? "ಕನ್ನಡ" : "हिन्दी"}
            </button>
          ))}
        </div>

        {/* Slide indicators */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? "bg-saffron scale-125" : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(0)}
          className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 text-sm"
        >
          Restart
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex overflow-hidden">
        {slide.image_url && (
          <div className="w-1/2 h-full flex items-center justify-center bg-black/20 p-8">
            <img
              src={slide.image_url}
              alt={slide.title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        )}
        <div
          className={`${slide.image_url ? "w-1/2" : "w-full"} flex flex-col justify-center p-12`}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-saffron">
            {slide.title}
          </h2>
          <div
            className="text-xl md:text-2xl leading-relaxed text-text-light/90"
            dangerouslySetInnerHTML={{ __html: slide.content }}
          />
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          onClick={() => goTo((current - 1 + slides.length) % slides.length)}
          className="ml-4 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl text-white/70 hover:bg-white/20 transition-colors"
        >
          ‹
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={() => goTo((current + 1) % slides.length)}
          className="mr-4 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl text-white/70 hover:bg-white/20 transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  );
}
