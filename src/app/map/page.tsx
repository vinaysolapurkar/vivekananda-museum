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
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function MapPage() {
  const [locations, setLocations] = useState<TravelLocation[]>([]);
  const [selected, setSelected] = useState<TravelLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const autoRotateRef = useRef(true);
  const rotateIndexRef = useRef(0);

  // Load Leaflet from CDN
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).L) {
      setMapReady(true);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  // Fetch locations
  useEffect(() => {
    fetch("/api/map/locations")
      .then((r) => r.json())
      .then((d) => {
        setLocations(d.locations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapReady || !mapRef.current || leafletMap.current) return;
    const L = (window as any).L;

    const map = L.map(mapRef.current, {
      center: [20, 40],
      zoom: 3,
      zoomControl: false,
      attributionControl: false,
      minZoom: 2,
      maxZoom: 8,
    });

    // Dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
    }).addTo(map);

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, [mapReady]);

  const selectLocation = useCallback((loc: TravelLocation) => {
    setSelected(loc);
    if (leafletMap.current) {
      leafletMap.current.flyTo([loc.lat, loc.lng], 6, { duration: 1.5 });
    }
    // Highlight marker
    markersRef.current.forEach((m, i) => {
      if (locations[i]?.id === loc.id) {
        m.setRadius(10);
        m.setStyle({ fillOpacity: 1, weight: 2 });
      } else {
        m.setRadius(5);
        m.setStyle({ fillOpacity: 0.7, weight: 1 });
      }
    });
  }, [locations]);

  // Add markers when locations + map are ready
  useEffect(() => {
    if (!leafletMap.current || locations.length === 0 || !mapReady) return;
    const L = (window as any).L;
    const map = leafletMap.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Draw route line
    const routeCoords = locations.map((loc) => [loc.lat, loc.lng] as [number, number]);
    if (routeCoords.length > 1) {
      L.polyline(routeCoords, {
        color: "#D4A34F",
        weight: 1.5,
        opacity: 0.3,
        dashArray: "6, 8",
      }).addTo(map);
    }

    // Add markers
    locations.forEach((loc, i) => {
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 5,
        fillColor: "#D4A34F",
        color: "#E8B84B",
        weight: 1,
        fillOpacity: 0.7,
      }).addTo(map);

      marker.on("click", () => {
        autoRotateRef.current = false;
        selectLocation(loc);
      });

      // Tooltip
      marker.bindTooltip(
        `<span style="font-family:Cormorant Garamond,serif;font-size:13px;font-weight:600;color:#F5F0E8">${loc.name}</span><br/><span style="font-size:10px;color:#D4A34F">${loc.year}</span>`,
        {
          permanent: false,
          direction: "top",
          offset: [0, -8],
          className: "leaflet-dark-tooltip",
        }
      );

      markersRef.current[i] = marker;
    });

    // Fit bounds
    if (routeCoords.length > 0) {
      map.fitBounds(L.latLngBounds(routeCoords), { padding: [60, 60] });
    }
  }, [locations, mapReady, selectLocation]);

  // Auto-rotate
  useEffect(() => {
    if (locations.length === 0) return;
    const interval = setInterval(() => {
      if (!autoRotateRef.current) return;
      const idx = rotateIndexRef.current % locations.length;
      selectLocation(locations[idx]);
      rotateIndexRef.current = idx + 1;
    }, 8000);
    const initial = setTimeout(() => {
      if (autoRotateRef.current && locations.length > 0) {
        selectLocation(locations[0]);
        rotateIndexRef.current = 1;
      }
    }, 2000);
    return () => { clearInterval(interval); clearTimeout(initial); };
  }, [locations, selectLocation]);

  if (loading || !mapReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#0A0E27" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-transparent rounded-full animate-spin mb-6 mx-auto" style={{ borderTopColor: '#D4A34F' }} />
          <p className="text-sm" style={{ color: '#8B8FA3' }}>Loading world map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#0A0E27" }}>
      {/* Custom tooltip styles */}
      <style>{`
        .leaflet-dark-tooltip {
          background: rgba(10,14,39,0.95) !important;
          border: 1px solid rgba(212,163,79,0.2) !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
        }
        .leaflet-dark-tooltip::before {
          border-top-color: rgba(10,14,39,0.95) !important;
        }
        .leaflet-container {
          background: #0A0E27 !important;
        }
      `}</style>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] px-8 py-5">
        <h1
          className="text-2xl md:text-3xl font-semibold"
          style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5F0E8' }}
        >
          Vivekananda&apos;s World Travels
        </h1>
        <p className="text-sm mt-1" style={{ color: '#8B8FA3' }}>
          Journey of a Wandering Monk (1863&ndash;1902)
        </p>
      </div>

      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0" />

      {/* Info panel */}
      {selected && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] max-w-lg w-[calc(100%-2rem)]"
          onClick={() => {
            setSelected(null);
            autoRotateRef.current = true;
          }}
        >
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(10,14,39,0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(212,163,79,0.15)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: '#D4A34F' }} />
              <span
                className="text-[10px] uppercase tracking-[0.2em] font-medium"
                style={{ color: '#D4A34F' }}
              >
                {selected.phase} &middot; {selected.year}
              </span>
            </div>
            <h2
              className="text-2xl font-semibold mb-1"
              style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5F0E8' }}
            >
              {selected.name}
            </h2>
            <p className="text-sm mb-3" style={{ color: '#8B8FA3' }}>{selected.country}</p>
            <p className="leading-relaxed text-sm" style={{ color: 'rgba(245,240,232,0.75)' }}>{selected.description}</p>
          </div>
        </div>
      )}

      {/* Bottom quote */}
      <div className="absolute bottom-3 right-6 z-[999]">
        <p
          className="text-xs italic"
          style={{ fontFamily: '"Cormorant Garamond", serif', color: 'rgba(212,163,79,0.12)' }}
        >
          &ldquo;All the powers in the universe are already ours.&rdquo;
        </p>
      </div>
    </div>
  );
}
