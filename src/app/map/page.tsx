"use client";

import { useState, useEffect, useRef } from "react";

interface TravelLocation {
  id: number;
  name: string;
  country: string;
  lat: number;
  lng: number;
  year: string;
  description: string;
  phase: string;
}

// Convert lat/lng to SVG x/y on a simple equirectangular projection
function toSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}

const PHASE_COLORS: Record<string, string> = {
  "Early Life": "#4CAF50",
  "Spiritual Quest": "#9C27B0",
  "Wandering Monk": "#FF9800",
  "World Mission": "#FF8F00",
  "Second Western Visit": "#E91E63",
  "Return to India": "#2196F3",
  "Later Years": "#607D8B",
  Legacy: "#FFD700",
};

export default function MapPage() {
  const [locations, setLocations] = useState<TravelLocation[]>([]);
  const [selected, setSelected] = useState<TravelLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const autoRotateRef = useRef(true);
  const rotateIndexRef = useRef(0);

  useEffect(() => {
    fetch("/api/map/locations")
      .then((r) => r.json())
      .then((d) => {
        setLocations(d.locations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Auto-rotate through locations every 10 seconds
  useEffect(() => {
    if (locations.length === 0) return;
    const interval = setInterval(() => {
      if (!autoRotateRef.current) return;
      const idx = rotateIndexRef.current % locations.length;
      setSelected(locations[idx]);
      rotateIndexRef.current = idx + 1;
    }, 10000);
    // Show first location after a short delay
    const initial = setTimeout(() => {
      if (autoRotateRef.current && locations.length > 0) {
        setSelected(locations[0]);
        rotateIndexRef.current = 1;
      }
    }, 2000);
    return () => { clearInterval(interval); clearTimeout(initial); };
  }, [locations]);

  if (loading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: "#0a0a1a" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-saffron rounded-full animate-spin mb-6 mx-auto" />
          <p className="text-white/60 text-xl">Loading world map...</p>
        </div>
      </div>
    );
  }

  // Build travel route path
  const routePoints = locations.map((loc) => toSvg(loc.lat, loc.lng));
  const routePath =
    routePoints.length > 1
      ? `M ${routePoints.map((p) => `${p.x},${p.y}`).join(" L ")}`
      : "";

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #0d1447 50%, #1a1a2e 100%)" }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-8 py-5 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold text-white"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Vivekananda&apos;s World Travels
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Journey of a Wandering Monk (1863–1902)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {Object.entries(PHASE_COLORS).map(([phase, color]) => (
            <span
              key={phase}
              className="text-xs px-2 py-1 rounded-full text-white/80"
              style={{ background: `${color}33`, border: `1px solid ${color}66` }}
            >
              {phase}
            </span>
          ))}
        </div>
      </div>

      {/* SVG World Map */}
      <svg
        ref={svgRef}
        viewBox="0 0 1000 500"
        className="absolute inset-0 w-full h-full"
        style={{ marginTop: "60px" }}
      >
        {/* Grid lines for continents hint */}
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF8F00" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF8F00" stopOpacity="0" />
          </radialGradient>
          <filter id="blur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Simplified world continent outlines */}
        {/* North America */}
        <path
          d="M100,80 L180,60 L230,80 L260,120 L250,170 L220,200 L200,220 L170,230 L140,210 L120,180 L90,150 L85,120 Z"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        {/* South America */}
        <path
          d="M200,250 L230,240 L260,260 L270,300 L260,340 L240,380 L220,400 L200,380 L190,340 L185,300 Z"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        {/* Europe */}
        <path
          d="M440,70 L480,60 L520,70 L540,90 L530,120 L510,130 L490,140 L460,130 L440,120 L430,100 Z"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        {/* Africa */}
        <path
          d="M460,170 L510,160 L540,180 L550,220 L545,270 L530,320 L510,350 L490,340 L475,310 L460,270 L450,220 Z"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        {/* Asia */}
        <path
          d="M540,60 L620,50 L700,60 L760,80 L800,100 L810,130 L790,160 L760,180 L720,200 L680,210 L640,200 L600,180 L570,160 L550,130 L540,100 Z"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        {/* India subcontinent */}
        <path
          d="M640,170 L670,160 L690,180 L695,210 L680,240 L660,260 L640,250 L630,220 L625,190 Z"
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,143,0,0.3)"
          strokeWidth="0.8"
        />
        {/* Australia */}
        <path
          d="M780,300 L830,290 L860,310 L860,340 L840,360 L810,360 L785,340 L775,320 Z"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />

        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const y = ((90 - lat) / 180) * 500;
          return (
            <line
              key={lat}
              x1="0"
              y1={y}
              x2="1000"
              y2={y}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Travel route - glowing line */}
        {routePath && (
          <>
            <path
              d={routePath}
              fill="none"
              stroke="#FF8F00"
              strokeWidth="3"
              strokeOpacity="0.15"
              filter="url(#blur)"
            />
            <path
              d={routePath}
              fill="none"
              stroke="#FF8F00"
              strokeWidth="1"
              strokeOpacity="0.5"
              strokeDasharray="6,4"
            />
          </>
        )}

        {/* Location markers */}
        {locations.map((loc) => {
          const pos = toSvg(loc.lat, loc.lng);
          const color = PHASE_COLORS[loc.phase] || "#FF8F00";
          const isSelected = selected?.id === loc.id;

          return (
            <g
              key={loc.id}
              onClick={() => {
                autoRotateRef.current = false;
                setSelected(isSelected ? null : loc);
              }}
              className="cursor-pointer"
            >
              {/* Glow */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 16 : 10}
                fill={color}
                opacity={isSelected ? 0.2 : 0.1}
              />
              {/* Pulse animation ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 10 : 6}
                fill="none"
                stroke={color}
                strokeWidth="0.5"
                opacity="0.4"
              >
                <animate
                  attributeName="r"
                  from={isSelected ? "10" : "6"}
                  to={isSelected ? "20" : "14"}
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.4"
                  to="0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 5 : 3.5}
                fill={color}
                stroke="white"
                strokeWidth={isSelected ? 1.5 : 0.8}
              />
              {/* Label */}
              <text
                x={pos.x}
                y={pos.y - 10}
                textAnchor="middle"
                fill="white"
                fontSize={isSelected ? "10" : "7"}
                fontWeight={isSelected ? "bold" : "normal"}
                opacity={isSelected ? 1 : 0.7}
              >
                {loc.name}
              </text>
              {!isSelected && (
                <text
                  x={pos.x}
                  y={pos.y + 14}
                  textAnchor="middle"
                  fill={color}
                  fontSize="6"
                  opacity="0.7"
                >
                  {loc.year}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Info panel */}
      {selected && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 max-w-lg w-full mx-4"
          onClick={() => {
            setSelected(null);
            autoRotateRef.current = true;
          }}
        >
          <div
            className="rounded-2xl p-6 backdrop-blur-md"
            style={{
              background: "rgba(13, 20, 71, 0.9)",
              border: `1px solid ${PHASE_COLORS[selected.phase] || "#FF8F00"}44`,
              boxShadow: `0 0 40px ${PHASE_COLORS[selected.phase] || "#FF8F00"}22`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: PHASE_COLORS[selected.phase] || "#FF8F00" }}
              />
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: PHASE_COLORS[selected.phase] || "#FF8F00" }}
              >
                {selected.phase} &middot; {selected.year}
              </span>
            </div>
            <h2
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {selected.name}
            </h2>
            <p className="text-white/50 text-sm mb-3">{selected.country}</p>
            <p className="text-white/80 leading-relaxed">{selected.description}</p>
          </div>
        </div>
      )}

      {/* Bottom quote */}
      <div className="absolute bottom-3 right-6 z-10">
        <p
          className="text-white/10 text-xs italic"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          &ldquo;All the powers in the universe are already ours.&rdquo;
        </p>
      </div>
    </div>
  );
}
