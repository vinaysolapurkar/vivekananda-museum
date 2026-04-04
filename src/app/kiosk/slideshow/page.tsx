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

  // Fetch categories
  useEffect(() => {
    fetch("/api/slideshow/categories")
      .then((r) => r.json())
      .then((d) => setCategories((d.categories || []).filter((c: Category) => c.image_count > 0)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Log analytics
  const logEvent = (type: string, itemId: string, itemName: string) => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: type, module: "slideshow", item_id: itemId, item_name: itemName }),
    }).catch(() => {});
  };

  // Select category and load images
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

  // Auto-advance based on duration_seconds
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
    setTransitioning(true);
    setTimeout(() => {
      const next = current + 1;
      if (next >= images.length) {
        // Return to category list
        setSelectedCat(null);
        setImages([]);
        setCurrent(0);
      } else {
        setCurrent(next);
        logEvent("slide_view", String(images[next]?.id), images[next]?.title || "");
      }
      setTransitioning(false);
    }, 400);
  }, [images, current]);

  const goPrev = useCallback(() => {
    if (images.length === 0) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent((prev) => Math.max(0, prev - 1));
      setTransitioning(false);
    }, 400);
  }, [images]);

  // Keyboard + touch
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

  // Loading
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#7B2D26' }}>
        <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Category selection screen
  if (!selectedCat) {
    return (
      <div className="fixed inset-0 overflow-auto" style={{ background: '#FFF8F0' }}>
        {/* Header */}
        <div className="text-center px-8 pt-12 pb-8" style={{ background: 'linear-gradient(170deg, #7B2D26, #9B3D34)' }}>
          <div className="text-3xl mb-2 opacity-60" style={{ color: '#DDAA4F' }}>ॐ</div>
          <h1 className="text-4xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FFF8F0' }}>
            Vivekananda Smriti
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,248,240,0.6)' }}>
            Select a topic to explore
          </p>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat)}
                className="text-left rounded-2xl p-6 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'white',
                  border: '1px solid #E8D8C8',
                  boxShadow: '0 2px 12px rgba(139,69,19,0.08)',
                }}
              >
                <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-xl"
                  style={{ background: '#E07B2E15', color: '#E07B2E' }}>
                  🖼
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2C1810' }}>
                  {cat.name}
                </h3>
                <p className="text-xs" style={{ color: '#8B7B6B' }}>
                  {cat.description}
                </p>
                <p className="text-xs mt-2 font-medium" style={{ color: '#C8963E' }}>
                  {cat.image_count} slides →
                </p>
              </button>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-16" style={{ color: '#8B7B6B' }}>
              <p className="text-xl mb-2">No exhibits available yet</p>
              <p className="text-sm">Content is being prepared</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Slideshow view
  const slide = images[current];

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden select-none" style={{ background: '#1a1a1a' }}
      onClick={goNext}>
      {/* Image */}
      <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: transitioning ? 0 : 1 }}>
        {slide?.image_url && (
          <img src={slide.image_url} alt={slide.title} className="w-full h-full object-contain" />
        )}
      </div>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

      {/* Info overlay */}
      {(slide?.title || slide?.description) && (
        <div className="absolute bottom-16 left-8 right-8 transition-opacity duration-500" style={{ opacity: transitioning ? 0 : 1 }}>
          {slide.title && (
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {slide.title}
            </h2>
          )}
          {slide.description && <p className="text-sm text-white/70">{slide.description}</p>}
        </div>
      )}

      {/* Station badge */}
      {slide?.station_number && (
        <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: 'rgba(224,123,46,0.9)', color: 'white' }}>
          Station {slide.station_number}
        </div>
      )}

      {/* Category name */}
      <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full text-xs"
        style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.6)' }}>
        {selectedCat.name}
      </div>

      {/* Progress */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="h-full transition-all duration-500"
          style={{ width: `${((current + 1) / images.length) * 100}%`, background: 'linear-gradient(90deg, #E07B2E, #C8963E)' }} />
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <div key={i} className="h-1 rounded-full transition-all duration-300"
            style={{ width: i === current ? '20px' : '5px', background: i === current ? '#E07B2E' : 'rgba(255,255,255,0.2)' }} />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute bottom-5 right-6 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {current + 1} / {images.length}
      </div>
    </div>
  );
}
