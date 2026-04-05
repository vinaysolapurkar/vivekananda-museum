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

const PHASE_COLORS: Record<string, string> = {
  "Formative Years": "#E8C06A",
  "First Wanderings": "#D4A34F",
  "Himalayas & Rajputana": "#C8963E",
  "Gujarat Circuit": "#E07B2E",
  "Southern India": "#9B3D34",
  "Kanyakumari Resolve": "#dc3c3c",
  "Preparation": "#C8A882",
  "First Western Journey": "#7A9E7D",
  "Parliament of Religions": "#FFD700",
  "American Lectures": "#5B9BD5",
  "European Mission": "#8B6FB0",
  "Triumphal Return": "#E8C06A",
  "Institutional Building": "#D4A34F",
  "Kashmir & Final Years": "#7A9E7D",
  "Second Western Journey": "#5B9BD5",
  "Final Pilgrimages": "#C8963E",
  "Mahasamadhi": "#dc3c3c",
};

export default function MapPage() {
  const [locations, setLocations] = useState<TravelLocation[]>([]);
  const [current, setCurrent] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [globeReady, setGlobeReady] = useState(false);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visitedUpTo, setVisitedUpTo] = useState(-1);

  // Load globe.gl from CDN
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Globe) {
      setGlobeReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/globe.gl@2.45.2/dist/globe.gl.min.js";
    script.onload = () => setGlobeReady(true);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // Fetch locations
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

  // Initialize globe
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
      .pointsData([])
      .pointLat("lat")
      .pointLng("lng")
      .pointColor("color")
      .pointAltitude("alt")
      .pointRadius("radius")
      .arcsData([])
      .arcColor("color")
      .arcAltitude(0.08)
      .arcStroke("stroke")
      .arcDashLength("dashLen")
      .arcDashGap("dashGap")
      .arcDashAnimateTime("animTime")
      .width(globeContainerRef.current.clientWidth)
      .height(globeContainerRef.current.clientHeight)
      (globeContainerRef.current);

    // Set initial view to India
    globe.pointOfView({ lat: 20, lng: 78, altitude: 2.5 }, 0);

    // Dim the globe slightly for better contrast
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.enableZoom = true;

    globeRef.current = globe;

    // Handle resize
    const handleResize = () => {
      if (globeContainerRef.current && globeRef.current) {
        globeRef.current.width(globeContainerRef.current.clientWidth);
        globeRef.current.height(globeContainerRef.current.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [globeReady, locations]);

  // Navigate to a location
  const flyTo = useCallback((index: number) => {
    if (!globeRef.current || index < 0 || index >= locations.length) return;
    const loc = locations[index];
    const globe = globeRef.current;

    // Stop auto-rotate during navigation
    globe.controls().autoRotate = false;

    // Determine zoom level based on phase
    const isGlobal = ["First Western Journey", "Second Western Journey", "European Mission", "American Lectures", "Parliament of Religions"].includes(loc.phase);
    const altitude = isGlobal ? 1.8 : 0.8;

    // Fly to location
    globe.pointOfView({ lat: loc.lat, lng: loc.lng, altitude }, 2000);

    setCurrent(index);
    setVisitedUpTo(Math.max(visitedUpTo, index));

    // Update points: all visited locations shown
    const visiblePoints = locations.slice(0, index + 1).map((l, i) => ({
      lat: l.lat,
      lng: l.lng,
      color: i === index ? "#FFD700" : (PHASE_COLORS[l.phase] || "#D4A34F") + "66",
      radius: i === index ? 0.5 : 0.15,
      alt: i === index ? 0.02 : 0.005,
      name: l.name,
    }));
    globe.pointsData(visiblePoints);

    // Only show the current flight arc (previous → current), no trail clutter
    if (index > 0) {
      const prev = locations[index - 1];
      globe.arcsData([{
        startLat: prev.lat,
        startLng: prev.lng,
        endLat: loc.lat,
        endLng: loc.lng,
        color: ["rgba(212,163,79,0.6)", PHASE_COLORS[loc.phase] || "#D4A34F"],
        stroke: 1.2,
        dashLen: 0.3,
        dashGap: 0.15,
        animTime: 1500,
      }]);
    } else {
      globe.arcsData([]);
    }
  }, [locations, visitedUpTo]);

  // Auto-play
  const playNext = useCallback(() => {
    setCurrent(prev => {
      const next = prev + 1;
      if (next >= locations.length) {
        setPlaying(false);
        return prev;
      }
      flyTo(next);
      // Schedule next - longer pause at important locations
      const loc = locations[next];
      const isImportant = ["Parliament of Religions", "Kanyakumari Resolve", "Mahasamadhi", "Institutional Building"].includes(loc.phase);
      const delay = isImportant ? 8000 : 5000;
      timerRef.current = setTimeout(() => playNext(), delay);
      return next;
    });
  }, [locations, flyTo]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      setPlaying(true);
      const startIdx = current < 0 ? -1 : current;
      setCurrent(startIdx);
      // Small delay then start
      timerRef.current = setTimeout(() => {
        const next = startIdx + 1;
        if (next < locations.length) {
          flyTo(next);
          const loc = locations[next];
          const isImportant = ["Parliament of Religions", "Kanyakumari Resolve", "Mahasamadhi"].includes(loc.phase);
          timerRef.current = setTimeout(() => playNext(), isImportant ? 8000 : 5000);
        }
      }, 500);
    }
  };

  const goToLocation = (index: number) => {
    if (playing) {
      setPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    flyTo(index);
  };

  // Cleanup
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const loc = current >= 0 && current < locations.length ? locations[current] : null;
  const phaseColor = loc ? (PHASE_COLORS[loc.phase] || "#D4A34F") : "#D4A34F";

  if (loading || !globeReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{
        background: 'linear-gradient(170deg, #1a0f0a 0%, #0a0604 100%)',
      }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-transparent rounded-full animate-spin mb-6 mx-auto" style={{ borderTopColor: '#D4A34F' }} />
          <p className="text-sm" style={{ color: '#9B8A72' }}>Loading the globe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#000" }}>
      {/* Globe container */}
      <div ref={globeContainerRef} className="absolute inset-0" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4" style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" style={{
              fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}>
              Vivekananda&apos;s World Travels
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#9B8A72' }}>
              Journey of a Parivrajaka (1863&ndash;1902) &middot; {locations.length} locations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="px-3 py-1.5 rounded-full text-xs font-medium" style={{
              background: 'rgba(255,255,255,0.1)', color: '#C8A882', border: '1px solid rgba(255,255,255,0.1)',
            }}>
              ← Home
            </a>
            <button
              onClick={togglePlay}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all active:scale-95"
              style={{
                background: playing ? 'rgba(180,60,60,0.3)' : 'rgba(212,163,79,0.2)',
                color: playing ? '#f88' : '#E8C06A',
                border: playing ? '1px solid rgba(180,60,60,0.4)' : '1px solid rgba(212,163,79,0.3)',
              }}
            >
              {playing ? "⏸ Pause" : "▶ Play Journey"}
            </button>
          </div>
        </div>
      </div>

      {/* Timeline scrubber — left side */}
      <div className="absolute left-3 top-20 bottom-20 z-10 w-48 overflow-y-auto kiosk-scroll" style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
      }}>
        <div className="space-y-0.5 py-4">
          {locations.map((l, i) => {
            const isActive = i === current;
            const isVisited = i <= visitedUpTo;
            const color = PHASE_COLORS[l.phase] || "#D4A34F";
            return (
              <button
                key={l.id}
                onClick={() => goToLocation(i)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] leading-tight transition-all flex items-center gap-2"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: isActive ? '#F5EDE0' : isVisited ? '#9B8A72' : 'rgba(155,138,114,0.4)',
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                  background: isActive ? '#FFD700' : isVisited ? color : 'rgba(155,138,114,0.3)',
                  boxShadow: isActive ? `0 0 6px ${color}` : 'none',
                }} />
                <span className="truncate">{l.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info panel — bottom */}
      {loc && (
        <div className="absolute bottom-0 left-0 right-0 z-10" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
        }}>
          <div className="px-6 pb-5 pt-12">
            {/* Phase badge */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: phaseColor, boxShadow: `0 0 8px ${phaseColor}` }} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: phaseColor }}>
                {loc.phase}
              </span>
              <span className="text-[10px]" style={{ color: 'rgba(200,168,130,0.5)' }}>&middot;</span>
              <span className="text-[10px] font-mono" style={{ color: '#C8A882' }}>{loc.year}</span>
              <span className="text-[10px]" style={{ color: 'rgba(200,168,130,0.5)' }}>&middot;</span>
              <span className="text-[10px]" style={{ color: 'rgba(200,168,130,0.5)' }}>{current + 1} / {locations.length}</span>
            </div>

            {/* Location name */}
            <h2 className="text-3xl font-semibold mb-1" style={{
              fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}>
              {loc.name}
            </h2>
            <p className="text-xs mb-3" style={{ color: '#9B8A72' }}>{loc.country}</p>

            {/* Description */}
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(217,203,186,0.85)', maxWidth: '800px' }}>
              {loc.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => goToLocation(Math.max(0, current - 1))}
                disabled={current <= 0}
                className="px-4 py-2 rounded-full text-xs font-medium disabled:opacity-20 transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#C8A882', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                ← Previous
              </button>
              <button
                onClick={() => goToLocation(Math.min(locations.length - 1, current + 1))}
                disabled={current >= locations.length - 1}
                className="px-4 py-2 rounded-full text-xs font-medium disabled:opacity-20 transition-all"
                style={{ background: 'rgba(212,163,79,0.15)', color: '#E8C06A', border: '1px solid rgba(212,163,79,0.2)' }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start prompt — when nothing selected */}
      {!loc && !playing && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center">
          <button
            onClick={togglePlay}
            className="px-8 py-3 rounded-full text-base font-medium transition-all active:scale-95"
            style={{
              background: 'rgba(212,163,79,0.2)',
              color: '#E8C06A',
              border: '1px solid rgba(212,163,79,0.3)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(212,163,79,0.15)',
            }}
          >
            ▶ Begin the Journey
          </button>
          <p className="text-[10px] mt-3" style={{ color: 'rgba(155,138,114,0.4)' }}>
            76 locations across 4 continents &middot; 1863–1902
          </p>
        </div>
      )}
    </div>
  );
}
