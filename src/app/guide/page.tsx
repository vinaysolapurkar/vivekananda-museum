"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useServiceWorker, InstallBanner, OfflineIndicator } from "./pwa";

type Lang = "en" | "kn" | "hi";

const langLabels: Record<Lang, string> = {
  en: "English",
  kn: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1",
  hi: "\u0939\u093F\u0928\u094D\u0926\u0940",
};

interface Station {
  number: number;
  title: string;
  title_kn?: string;
  title_hi?: string;
  description: string;
  description_kn?: string;
  description_hi?: string;
  gallery_zone: string;
  audio_url?: string;
}

export default function GuidePage() {
  const [lang, setLang] = useState<Lang>("en");
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("all");

  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/audio/stations?lang=${lang}`);
      const data = await res.json();
      setStations(data.stations || []);
    } catch {
      setError("Could not load stations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => { fetchStations(); }, [fetchStations]);

  const { isOnline } = useServiceWorker();

  const zones = ["all", ...Array.from(new Set(stations.map(s => s.gallery_zone).filter(Boolean)))];
  const filtered = selectedZone === "all" ? stations : stations.filter(s => s.gallery_zone === selectedZone);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0A0E27' }}>
      <OfflineIndicator isOnline={isOnline} />
      {/* Install Banner */}
      <InstallBanner />
      {/* Header */}
      <header className="relative overflow-hidden px-6 py-8">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(212,163,79,0.06) 0%, transparent 100%)'
        }} />
        <div className="relative max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium mb-5 transition-colors duration-300"
            style={{ color: '#D4A34F' }}
          >
            <span>&larr;</span> <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212,163,79,0.1)', border: '1px solid rgba(212,163,79,0.15)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4A34F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5F0E8' }}>
                Audio Guide
              </h1>
              <p className="text-sm" style={{ color: '#8B8FA3' }}>Ramakrishna Ashram, Mysore</p>
            </div>
          </div>
        </div>
      </header>

      {/* Language Selector */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] tracking-[0.2em] uppercase mb-3" style={{ color: '#8B8FA3' }}>
            Select Language
          </p>
          <div className="flex gap-3">
            {(Object.keys(langLabels) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300"
                style={{
                  background: lang === l ? 'rgba(212,163,79,0.15)' : 'rgba(255,255,255,0.03)',
                  color: lang === l ? '#E8B84B' : '#8B8FA3',
                  border: lang === l ? '1px solid rgba(212,163,79,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {langLabels[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Zone Filter */}
      {zones.length > 1 && (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto pb-1 kiosk-scroll">
            {zones.map(zone => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300"
                style={{
                  background: selectedZone === zone ? 'rgba(212,163,79,0.15)' : 'rgba(255,255,255,0.03)',
                  color: selectedZone === zone ? '#E8B84B' : '#8B8FA3',
                  border: selectedZone === zone ? '1px solid rgba(212,163,79,0.2)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {zone === 'all' ? 'All Zones' : zone}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#D4A34F' }} />
            <p className="text-sm" style={{ color: '#8B8FA3' }}>Loading guide...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8B8FA3" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ color: '#8B8FA3' }}>{error}</p>
            <button
              onClick={fetchStations}
              className="px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300"
              style={{ background: 'rgba(212,163,79,0.15)', color: '#D4A34F', border: '1px solid rgba(212,163,79,0.3)' }}
            >
              Try Again
            </button>
          </div>
        ) : stations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8B8FA3" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <h2 className="text-xl font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5F0E8' }}>
              No Stations Yet
            </h2>
            <p className="text-sm max-w-xs" style={{ color: '#8B8FA3' }}>
              The audio guide content is being prepared. Please check back soon.
            </p>
            <Link
              href="/"
              className="mt-4 px-6 py-3 rounded-xl font-medium text-sm"
              style={{ background: 'rgba(212,163,79,0.15)', color: '#D4A34F', border: '1px solid rgba(212,163,79,0.3)' }}
            >
              Return Home
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 mt-2">
              <p className="text-sm" style={{ color: '#8B8FA3' }}>
                {filtered.length} station{filtered.length !== 1 ? 's' : ''} available
              </p>
              <p className="text-xs" style={{ color: 'rgba(139,143,163,0.5)' }}>Tap to listen</p>
            </div>

            <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
              {filtered.map((station, idx) => (
                <Link
                  key={station.number}
                  href={`/guide/${station.number}?lang=${lang}`}
                  className="group relative rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 animate-fade-in-up"
                  style={{
                    animationDelay: `${idx * 30}ms`,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,163,79,0.3)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  {station.gallery_zone && (
                    <span
                      className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(212,163,79,0.1)', color: '#D4A34F' }}
                    >
                      {station.gallery_zone}
                    </span>
                  )}
                  <span
                    className="text-3xl font-semibold mb-1 transition-colors"
                    style={{ fontFamily: '"Cormorant Garamond", serif', color: '#D4A34F' }}
                  >
                    {station.number}
                  </span>
                  <span className="text-xs leading-tight line-clamp-2 px-1" style={{ color: '#8B8FA3' }}>
                    {lang === 'kn' && station.title_kn ? station.title_kn :
                     lang === 'hi' && station.title_hi ? station.title_hi :
                     station.title || `Station ${station.number}`}
                  </span>
                  {station.audio_url ? (
                    <span className="absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity text-sm" style={{ color: '#D4A34F' }}>
                      &#9654;
                    </span>
                  ) : (
                    <svg className="absolute bottom-2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(139,143,163,0.4)" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-xs" style={{ color: 'rgba(139,143,163,0.5)' }}>
          Swami Vivekananda Smriti &middot; Ramakrishna Ashram, Mysore
        </p>
      </footer>
    </div>
  );
}
