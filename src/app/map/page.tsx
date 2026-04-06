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
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

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
    globe.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: isGlobal ? 1.8 : 0.8 }, 2000);
    setCurrent(index);

    // Expand the phase of this location
    setExpandedPhase(loc.phase);

    const visiblePoints = locations.slice(0, index + 1).map((l, i) => ({
      lat: l.lat, lng: l.lng,
      color: i === index ? "#FFD700" : (PHASE_COLORS[l.phase] || "#D4A34F") + "55",
      radius: i === index ? 0.5 : 0.12,
      alt: i === index ? 0.02 : 0.003,
    }));
    globe.pointsData(visiblePoints);

    if (index > 0) {
      const prev = locations[index - 1];
      globe.arcsData([{
        startLat: prev.lat, startLng: prev.lng, endLat: loc.lat, endLng: loc.lng,
        color: ["rgba(212,163,79,0.5)", PHASE_COLORS[loc.phase] || "#D4A34F"],
        stroke: 1.2, dashLen: 0.3, dashGap: 0.15, animTime: 1500,
      }]);
    } else {
      globe.arcsData([]);
    }

    // Scroll active item into view
    setTimeout(() => activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }, [locations]);

  const goNext = useCallback(() => { if (current + 1 < locations.length) flyTo(current + 1); }, [current, locations, flyTo]);
  const goPrev = useCallback(() => { if (current > 0) flyTo(current - 1); }, [current, flyTo]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const loc = current >= 0 && current < locations.length ? locations[current] : null;
  const phaseColor = loc ? (PHASE_COLORS[loc.phase] || "#D4A34F") : "#D4A34F";
  const isLast = current >= locations.length - 1;

  // Group locations by phase
  const grouped: Record<string, { locations: TravelLocation[]; startIdx: number }> = {};
  let idx = 0;
  for (const l of locations) {
    if (!grouped[l.phase]) grouped[l.phase] = { locations: [], startIdx: idx };
    grouped[l.phase].locations.push(l);
    idx++;
  }

  if (loading || !globeReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#080604' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-transparent rounded-full animate-spin mb-6 mx-auto" style={{ borderTopColor: '#D4A34F' }} />
          <p className="text-sm" style={{ color: '#9B8A72', fontFamily: '"Cormorant Garamond", serif' }}>Loading the globe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#080604" }}>
      <div ref={globeContainerRef} className="absolute inset-0" />

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3" style={{
        background: 'linear-gradient(to bottom, rgba(8,6,4,0.8) 0%, transparent 100%)',
      }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#C8A882', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <div>
            <h1 className="text-lg font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}>
              Vivekananda&apos;s Travels
            </h1>
            {loc && (
              <p className="text-[10px] font-mono" style={{ color: phaseColor }}>
                {current + 1} / {locations.length}
              </p>
            )}
          </div>
        </div>
        <a href="/" className="px-3 py-1.5 rounded-lg text-xs" style={{
          background: 'rgba(255,255,255,0.06)', color: '#9B8A72', border: '1px solid rgba(255,255,255,0.08)',
        }}>← Home</a>
      </div>

      {/* ── Phase navigator sidebar ── */}
      <div
        className="absolute top-0 left-0 bottom-0 z-30 transition-transform duration-300 overflow-hidden"
        style={{
          width: '320px',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-320px)',
          background: 'rgba(8,6,4,0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(212,163,79,0.08)',
        }}
      >
        <div className="p-5 pt-16 h-full overflow-y-auto kiosk-scroll">
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4" style={{ color: '#9B8A72' }}>
            Life Phases
          </p>

          {PHASES.map((phase) => {
            const group = grouped[phase.id];
            if (!group) return null;
            const isOpen = expandedPhase === phase.id;
            const hasActive = loc?.phase === phase.id;

            return (
              <div key={phase.id} className="mb-2">
                {/* Phase header */}
                <button
                  onClick={() => setExpandedPhase(isOpen ? null : phase.id)}
                  className="w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-all"
                  style={{
                    background: hasActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: hasActive ? `1px solid ${phase.color}30` : '1px solid transparent',
                  }}
                >
                  <span className="text-lg">{phase.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: hasActive ? '#F5EDE0' : '#C8A882' }}>{phase.label}</p>
                    <p className="text-[10px]" style={{ color: '#9B8A72' }}>{phase.years} &middot; {group.locations.length} places</p>
                  </div>
                  <span className="text-xs" style={{ color: phase.color }}>{isOpen ? '▾' : '▸'}</span>
                </button>

                {/* Expanded location list */}
                {isOpen && (
                  <div className="ml-4 mt-1 mb-2 pl-3" style={{ borderLeft: `2px solid ${phase.color}30` }}>
                    {group.locations.map((l, i) => {
                      const globalIdx = group.startIdx + i;
                      const isActive = globalIdx === current;
                      return (
                        <button
                          key={l.id}
                          ref={isActive ? activeItemRef : undefined}
                          onClick={() => { flyTo(globalIdx); setSidebarOpen(false); }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2"
                          style={{
                            background: isActive ? `${phase.color}20` : 'transparent',
                            color: isActive ? '#F5EDE0' : '#9B8A72',
                          }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                            background: isActive ? phase.color : `${phase.color}40`,
                            boxShadow: isActive ? `0 0 6px ${phase.color}` : 'none',
                          }} />
                          <span className="truncate">{l.name.split(' — ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sidebar overlay ── */}
      {sidebarOpen && (
        <div className="absolute inset-0 z-20" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Bottom info + navigation ── */}
      {loc ? (
        <div className="absolute bottom-0 left-0 right-0 z-10" style={{
          background: 'linear-gradient(to top, rgba(8,6,4,0.95) 0%, rgba(8,6,4,0.7) 70%, transparent 100%)',
        }}>
          <div className="px-5 pb-4 pt-10">
            {/* Phase + year + counter */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: phaseColor, boxShadow: `0 0 8px ${phaseColor}` }} />
              <span className="text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: phaseColor }}>{loc.phase}</span>
              <span className="text-[10px]" style={{ color: 'rgba(155,138,114,0.4)' }}>&middot; {loc.year}</span>
            </div>

            {/* Name + country */}
            <h2 className="text-xl font-semibold leading-tight" style={{
              fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0',
            }}>
              {loc.name.split(' — ')[0]}
            </h2>
            <p className="text-[11px] mt-0.5 mb-2" style={{ color: '#9B8A72' }}>{loc.country}</p>

            {/* Description */}
            {loc.description && (
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(217,203,186,0.8)', maxWidth: '700px' }}>
                {loc.description.length > 250 ? loc.description.substring(0, 250).replace(/\s\S*$/, '') + '...' : loc.description}
              </p>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                disabled={current <= 0}
                className="px-5 py-2.5 rounded-xl text-xs font-medium disabled:opacity-20 transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#C8A882', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                ← Prev
              </button>
              {isLast ? (
                <div className="flex-1 text-center py-2.5 rounded-xl text-xs font-semibold" style={{
                  background: 'rgba(231,76,60,0.12)', color: '#E74C3C', border: '1px solid rgba(231,76,60,0.2)',
                }}>
                  ॐ &nbsp;End of Journey &nbsp;·&nbsp; Om Shanti
                </div>
              ) : (
                <button
                  onClick={goNext}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                  style={{ background: 'rgba(212,163,79,0.12)', color: '#E8C06A', border: '1px solid rgba(212,163,79,0.2)' }}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-center">
          <button
            onClick={() => flyTo(0)}
            className="px-8 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background: 'rgba(212,163,79,0.15)', color: '#E8C06A',
              border: '1px solid rgba(212,163,79,0.25)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 30px rgba(212,163,79,0.1)',
              fontFamily: '"Cormorant Garamond", serif',
              letterSpacing: '0.05em',
            }}
          >
            Begin the Journey
          </button>
          <p className="text-[10px] mt-2 font-mono" style={{ color: 'rgba(155,138,114,0.4)' }}>
            {locations.length} locations &middot; 1863–1902
          </p>
        </div>
      )}
    </div>
  );
}
