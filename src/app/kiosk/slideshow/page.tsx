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
    setTransitioning(true);
    setTimeout(() => {
      const next = current + 1;
      if (next >= images.length) {
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

  // Category selection screen
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
            <div className="text-3xl mb-2 opacity-50" style={{ color: '#D4A34F' }}>ॐ</div>
            <h1 className="text-4xl font-light mb-2" style={{
              fontFamily: 'Cormorant Garamond, serif', color: '#F5EDE0',
              textShadow: '0 2px 16px rgba(0,0,0,0.4)',
            }}>
              Vivekananda Smriti
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

  // Slideshow view
  const slide = images[current];

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden select-none" style={{ background: '#0f0806' }}
      onClick={goNext}>
      <div className="absolute inset-0 transition-opacity duration-500 flex items-center justify-center" style={{ opacity: transitioning ? 0 : 1 }}>
        {slide?.image_url && (
          slide.crop_bottom ? (
            <div className="w-full h-full overflow-hidden">
              <img
                src={slide.image_url}
                alt={slide.title}
                className="w-full object-cover object-top"
                style={{ height: '106%' }}
              />
            </div>
          ) : (
            <img src={slide.image_url} alt={slide.title} className="w-full h-full object-contain" />
          )
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: 'linear-gradient(to top, rgba(15,8,6,0.8), transparent)' }} />

      {(slide?.title || slide?.description) && (
        <div className="absolute bottom-16 left-8 right-8 transition-opacity duration-500" style={{ opacity: transitioning ? 0 : 1 }}>
          {slide.title && (
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F5EDE0', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {slide.title}
            </h2>
          )}
          {slide.description && <p className="text-sm" style={{ color: 'rgba(217,203,186,0.7)' }}>{slide.description}</p>}
        </div>
      )}

      {slide?.station_number && (
        <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: 'rgba(212,163,79,0.8)', color: '#1a0f0a' }}>
          Station {slide.station_number}
        </div>
      )}

      <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full text-xs"
        style={{ background: 'rgba(26,15,10,0.6)', color: '#C8A882', border: '1px solid rgba(212,163,79,0.15)' }}>
        {selectedCat.name}
      </div>

      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'rgba(212,163,79,0.1)' }}>
        <div className="h-full transition-all duration-500"
          style={{ width: `${((current + 1) / images.length) * 100}%`, background: 'linear-gradient(90deg, #C8963E, #E8C06A)' }} />
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <div key={i} className="h-1 rounded-full transition-all duration-300"
            style={{ width: i === current ? '20px' : '5px', background: i === current ? '#D4A34F' : 'rgba(212,163,79,0.2)' }} />
        ))}
      </div>

      <div className="absolute bottom-5 right-6 text-xs font-mono" style={{ color: 'rgba(155,138,114,0.4)' }}>
        {current + 1} / {images.length}
      </div>
    </div>
  );
}
