"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TravelLocation {
  id: number;
  name: string;
  country: string;
  lat: number;
  lng: number;
  year: string;
  description: string;
  phase: string;
  sort_order: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

const PHASES = [
  { id: "Early Life & Indian Wandering", label: "Early Life & Wanderings", years: "1863–1893", color: "#F39C12", icon: "🇮🇳" },
  { id: "First Western Tour", label: "First Western Tour", years: "1893–1897", color: "#3498DB", icon: "🌍" },
  { id: "Return to India & Mission Building", label: "Return & Mission", years: "1897–1899", color: "#2ECC71", icon: "🏛" },
  { id: "Second Western Tour", label: "Second Western Tour", years: "1899–1900", color: "#9B59B6", icon: "✈" },
  { id: "Final Years & Mahasamadhi", label: "Final Years", years: "1900–1902", color: "#E74C3C", icon: "🕉" },
];

const PHASE_COLORS: Record<string, string> = Object.fromEntries(PHASES.map(p => [p.id, p.color]));

export default function MapPage() {
  const [locations, setLocations] = useState<TravelLocation[]>([]);
  const [current, setCurrent] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [globeReady, setGlobeReady] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Globe) { setGlobeReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/globe.gl@2.45.2/dist/globe.gl.min.js";
    script.onload = () => setGlobeReady(true);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    fetch("/api/map/locations")
      .then((r) => r.json())
      .then((d) => {
        const sorted = (d.locations || []).sort((a: TravelLocation, b: TravelLocation) => a.sort_order - b.sort_order);
        setLocations(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!globeReady || !globeContainerRef.current || globeRef.current || locations.length === 0) return;
    const Globe = (window as any).Globe;
    const globe = Globe()
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
      .showAtmosphere(true)
      .atmosphereColor("#D4A34F")
      .atmosphereAltitude(0.15)
      .pointsData([]).pointLat("lat").pointLng("lng").pointColor("color").pointAltitude("alt").pointRadius("radius")
      .arcsData([]).arcColor("color").arcAltitude(0.08).arcStroke("stroke")
      .arcDashLength("dashLen").arcDashGap("dashGap").arcDashAnimateTime("animTime")
      .width(globeContainerRef.current.clientWidth)
      .height(globeContainerRef.current.clientHeight)
      (globeContainerRef.current);

    globe.pointOfView({ lat: 20, lng: 78, altitude: 2.5 }, 0);
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.3;
    globe.controls().enableZoom = true;
    globeRef.current = globe;

    const handleResize = () => {
      if (globeContainerRef.current && globeRef.current) {
        globeRef.current.width(globeContainerRef.current.clientWidth);
        globeRef.current.height(globeContainerRef.current.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); };
  }, [globeReady, locations]);

  const flyTo = useCallback((index: number) => {
    if (!globeRef.current || index < 0 || index >= locations.length) return;
    const loc = locations[index];
    const globe = globeRef.current;
    globe.controls().autoRotate = false;
    const isGlobal = ["First Western Tour", "Second Western Tour"].includes(loc.phase);
    globe.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: isGlobal ? 1.8 : 0.8 }, 1500);
    setCurrent(index);

    const visiblePoints = locations.slice(0, index + 1).map((l, i) => ({
      lat: l.lat, lng: l.lng,
      color: i === index ? "#FFD700" : (PHASE_COLORS[l.phase] || "#D4A34F") + "44",
      radius: i === index ? 0.5 : 0.1,
      alt: i === index ? 0.02 : 0.003,
    }));
    globe.pointsData(visiblePoints);

    if (index > 0) {
      const prev = locations[index - 1];
      globe.arcsData([{
        startLat: prev.lat, startLng: prev.lng, endLat: loc.lat, endLng: loc.lng,
        color: ["rgba(212,163,79,0.4)", PHASE_COLORS[loc.phase] || "#D4A34F"],
        stroke: 1, dashLen: 0.3, dashGap: 0.15, animTime: 1500,
      }]);
    } else { globe.arcsData([]); }
  }, [locations]);

  const goNext = useCallback(() => { if (current + 1 < locations.length) flyTo(current + 1); }, [current, locations, flyTo]);
  const goPrev = useCallback(() => { if (current > 0) flyTo(current - 1); }, [current, flyTo]);

  useEffect(() => {
    if (!autoPlay || current < 0) return;
    timerRef.current = setTimeout(() => {
      if (current + 1 < locations.length) flyTo(current + 1);
      else setAutoPlay(false);
    }, 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [autoPlay, current, locations, flyTo]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); setAutoPlay(false); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); setAutoPlay(false); goPrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const loc = current >= 0 && current < locations.length ? locations[current] : null;
  const phaseColor = loc ? (PHASE_COLORS[loc.phase] || "#D4A34F") : "#D4A34F";
  const phaseInfo = loc ? PHASES.find(p => p.id === loc.phase) : null;
  const isLast = current >= locations.length - 1;

  if (loading || !globeReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#080604' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-transparent rounded-full animate-spin mb-6 mx-auto" style={{ borderTopColor: '#D4A34F' }} />
          <p style={{ color: '#9B8A72', fontFamily: '"Cormorant Garamond", serif' }}>Loading the globe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex" style={{ background: "#080604" }}>
      {/* ── Globe ── */}
      <div className="flex-1 relative">
        <div ref={globeContainerRef} className="absolute inset-0" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3" style={{
          background: 'linear-gradient(to bottom, rgba(8,6,4,0.8), transparent)',
        }}>
          <div>
            <h1 className="text-lg font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}>
              Vivekananda&apos;s World Travels
            </h1>
            <p className="text-[10px]" style={{ color: '#9B8A72' }}>
              {locations.length} locations &middot; 1863–1902
            </p>
          </div>
          <div className="flex gap-2">
            {current >= 0 && (
              <button onClick={() => setAutoPlay(!autoPlay)} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: autoPlay ? 'rgba(231,76,60,0.15)' : 'rgba(212,163,79,0.12)',
                  color: autoPlay ? '#E74C3C' : '#E8C06A',
                  border: autoPlay ? '1px solid rgba(231,76,60,0.3)' : '1px solid rgba(212,163,79,0.2)',
                }}>
                {autoPlay ? '⏸ Pause' : '▶ Auto'}
              </button>
            )}
            <a href="/" className="px-3 py-1.5 rounded-lg text-xs" style={{
              background: 'rgba(255,255,255,0.06)', color: '#9B8A72', border: '1px solid rgba(255,255,255,0.08)',
            }}>← Home</a>
          </div>
        </div>

        {/* Nav buttons bottom center of globe */}
        {loc && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            <button onClick={() => { setAutoPlay(false); goPrev(); }} disabled={current <= 0}
              className="px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-20 transition-all active:scale-95"
              style={{ background: 'rgba(8,6,4,0.85)', color: '#C8A882', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              ← Prev
            </button>
            {isLast ? (
              <div className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{
                background: 'rgba(231,76,60,0.15)', color: '#E74C3C', border: '1px solid rgba(231,76,60,0.3)',
              }}>ॐ Om Shanti</div>
            ) : (
              <button onClick={() => { setAutoPlay(false); goNext(); }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{ background: 'rgba(212,163,79,0.15)', color: '#E8C06A', border: '1px solid rgba(212,163,79,0.3)', backdropFilter: 'blur(10px)' }}>
                Next →
              </button>
            )}
          </div>
        )}

        {/* Start prompt */}
        {!loc && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center">
            <button onClick={() => { flyTo(0); setAutoPlay(true); }}
              className="px-8 py-3.5 rounded-2xl text-base font-semibold transition-all active:scale-95"
              style={{
                background: 'rgba(212,163,79,0.15)', color: '#E8C06A',
                border: '1px solid rgba(212,163,79,0.3)', backdropFilter: 'blur(12px)',
                fontFamily: '"Cormorant Garamond", serif',
              }}>
              Begin the Journey
            </button>
          </div>
        )}
      </div>

      {/* ── Right panel ── */}
      {loc && (
        <div className="w-[420px] shrink-0 flex flex-col" style={{
          background: '#0c0806',
          borderLeft: '1px solid rgba(212,163,79,0.06)',
        }}>
          {/* Phase color banner */}
          <div className="shrink-0 px-6 py-4" style={{
            background: `linear-gradient(135deg, ${phaseColor}18 0%, transparent 100%)`,
            borderBottom: `1px solid ${phaseColor}20`,
          }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{phaseInfo?.icon}</span>
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: phaseColor }}>
                {phaseInfo?.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: '#9B8A72' }}>{loc.year}</span>
              <span className="text-[10px]" style={{ color: 'rgba(155,138,114,0.3)' }}>&middot;</span>
              <span className="text-[10px] font-mono" style={{ color: phaseColor }}>{current + 1} / {locations.length}</span>
            </div>
          </div>

          {/* Vivekananda portrait — small, consistent */}
          <div className="shrink-0 px-6 pt-4 pb-2 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{
              border: `1.5px solid ${phaseColor}40`,
              boxShadow: `0 0 20px ${phaseColor}15`,
            }}>
              <img src="/images/vivekananda-portrait.jpg" alt="Swami Vivekananda"
                className="w-full h-full object-cover" style={{ filter: 'sepia(0.15)' }} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold leading-tight" style={{
                fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0',
              }}>
                {loc.name.split(' — ')[0]}
              </h2>
              {loc.name.includes(' — ') && (
                <p className="text-[11px] truncate" style={{ color: '#C8A882' }}>
                  {loc.name.split(' — ').slice(1).join(' — ')}
                </p>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="shrink-0 px-6 pb-3">
            <p className="text-xs" style={{ color: '#9B8A72' }}>{loc.country}</p>
          </div>

          {/* Separator */}
          <div className="shrink-0 mx-6 h-px" style={{ background: `linear-gradient(to right, ${phaseColor}25, transparent)` }} />

          {/* Description — scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 kiosk-scroll">
            <p className="text-sm leading-relaxed" style={{ color: '#D9CBBA', lineHeight: '1.8' }}>
              {loc.description || "A significant stop in Swami Vivekananda's journey across the world."}
            </p>
          </div>

          {/* Phase progress bar */}
          <div className="shrink-0 px-6 py-3" style={{ borderTop: '1px solid rgba(212,163,79,0.06)' }}>
            <div className="flex gap-1 mb-1">
              {PHASES.map((p) => {
                const phaseIdx = PHASES.findIndex(pp => pp.id === loc.phase);
                const thisIdx = PHASES.findIndex(pp => pp.id === p.id);
                return (
                  <div key={p.id} className="flex-1 h-1.5 rounded-full transition-all duration-500" style={{
                    background: thisIdx === phaseIdx ? p.color : thisIdx < phaseIdx ? `${p.color}60` : 'rgba(155,138,114,0.12)',
                  }} />
                );
              })}
            </div>
            <p className="text-[9px] text-center" style={{ color: 'rgba(155,138,114,0.4)' }}>
              {phaseInfo?.years}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
