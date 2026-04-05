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
    <div className="flex flex-col min-h-screen relative" style={{
      background: 'linear-gradient(170deg, #1a0f0a 0%, #2a1810 30%, #1c1008 100%)',
    }}>
      {/* Warm ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 80% 20%, rgba(212,163,79,0.06) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(123,45,38,0.08) 0%, transparent 50%)',
      }} />

      {/* Vivekananda portrait — right side, sepia presence */}
      <div className="fixed top-0 right-0 bottom-0 w-[45%] pointer-events-none z-0 opacity-[0.07]" style={{
        backgroundImage: 'url(/images/vivekananda-portrait.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right center',
        backgroundSize: 'auto 85%',
        maskImage: 'linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)',
        filter: 'sepia(0.4) brightness(1.2)',
      }} />

      <OfflineIndicator isOnline={isOnline} />
      <InstallBanner />

      {/* Header */}
      <header className="relative overflow-hidden px-6 pt-8 pb-6 z-10">
        {/* Warm gradient overlay on header */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(123,45,38,0.15) 0%, transparent 100%)',
        }} />

        <div className="relative w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium mb-5 transition-colors duration-300 hover:opacity-80"
            style={{ color: '#D4A34F' }}
          >
            <span>&larr;</span> <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl overflow-hidden shrink-0"
              style={{ border: '1.5px solid rgba(212,163,79,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
            >
              <img src="/images/vivekananda-portrait.jpg" alt="Swami Vivekananda" className="w-full h-full object-cover" style={{ filter: 'sepia(0.2)' }} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold" style={{
                fontFamily: '"Cormorant Garamond", serif',
                color: '#F5EDE0',
                textShadow: '0 2px 12px rgba(0,0,0,0.3)',
              }}>
                Audio Guide
              </h1>
              <p className="text-sm mt-0.5" style={{ color: '#C8A882' }}>Ramakrishna Ashram, Mysore</p>
            </div>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-6 right-6 h-px" style={{
          background: 'linear-gradient(to right, transparent, rgba(212,163,79,0.2) 20%, rgba(212,163,79,0.2) 80%, transparent)',
        }} />
      </header>

      {/* Language Selector */}
      <div className="px-6 py-4 relative z-10">
        <p className="text-[11px] tracking-[0.2em] uppercase mb-3 font-medium" style={{ color: '#9B8A72' }}>
          Select Language
        </p>
        <div className="flex gap-3">
          {(Object.keys(langLabels) as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300"
              style={{
                background: lang === l ? 'rgba(212,163,79,0.12)' : 'rgba(255,245,230,0.04)',
                color: lang === l ? '#E8C06A' : '#9B8A72',
                border: lang === l ? '1px solid rgba(212,163,79,0.3)' : '1px solid rgba(255,245,230,0.08)',
              }}
            >
              {langLabels[l]}
            </button>
          ))}
        </div>
        {/* Separator */}
        <div className="mt-4 h-px" style={{
          background: 'linear-gradient(to right, transparent, rgba(212,163,79,0.12) 20%, rgba(212,163,79,0.12) 80%, transparent)',
        }} />
      </div>

      {/* Zone Filter */}
      {zones.length > 1 && (
        <div className="px-6 py-3 relative z-10">
          <div className="w-full flex gap-2 overflow-x-auto pb-1 kiosk-scroll">
            {zones.map(zone => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300"
                style={{
                  background: selectedZone === zone ? 'rgba(212,163,79,0.12)' : 'rgba(255,245,230,0.04)',
                  color: selectedZone === zone ? '#E8C06A' : '#9B8A72',
                  border: selectedZone === zone ? '1px solid rgba(212,163,79,0.25)' : '1px solid rgba(255,245,230,0.08)',
                }}
              >
                {zone === 'all' ? 'All Zones' : zone}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 w-full px-6 py-4 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#D4A34F' }} />
            <p className="text-sm" style={{ color: '#9B8A72' }}>Loading guide...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9B8A72" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ color: '#9B8A72' }}>{error}</p>
            <button
              onClick={fetchStations}
              className="px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300"
              style={{ background: 'rgba(212,163,79,0.12)', color: '#D4A34F', border: '1px solid rgba(212,163,79,0.3)' }}
            >
              Try Again
            </button>
          </div>
        ) : stations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-2" style={{ border: '1.5px solid rgba(212,163,79,0.2)' }}>
              <img src="/images/vivekananda-portrait.jpg" alt="" className="w-full h-full object-cover" style={{ opacity: 0.5, filter: 'sepia(0.3)' }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}>
              No Stations Yet
            </h2>
            <p className="text-sm" style={{ color: '#9B8A72' }}>
              The audio guide content is being prepared. Please check back soon.
            </p>
            <Link
              href="/"
              className="mt-4 px-6 py-3 rounded-xl font-medium text-sm"
              style={{ background: 'rgba(212,163,79,0.12)', color: '#D4A34F', border: '1px solid rgba(212,163,79,0.3)' }}
            >
              Return Home
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 mt-2">
              <p className="text-sm font-medium" style={{ color: '#C8A882' }}>
                {filtered.length} station{filtered.length !== 1 ? 's' : ''} available
              </p>
              <p className="text-xs" style={{ color: 'rgba(155,138,114,0.6)' }}>Tap to listen</p>
            </div>

            <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {filtered.map((station, idx) => (
                <Link
                  key={station.number}
                  href={`/guide/${station.number}?lang=${lang}`}
                  className="group relative rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-300 animate-fade-in-up hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    animationDelay: `${idx * 30}ms`,
                    background: 'rgba(255,245,230,0.04)',
                    border: '1px solid rgba(212,163,79,0.1)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,163,79,0.3)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(212,163,79,0.08)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(212,163,79,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,163,79,0.1)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,245,230,0.04)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
                  }}
                >
                  {station.gallery_zone && (
                    <span
                      className="absolute top-2 right-2 text-[8px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(212,163,79,0.1)', color: '#C8A882' }}
                    >
                      {station.gallery_zone}
                    </span>
                  )}
                  <span
                    className="text-3xl font-semibold mb-1 transition-colors group-hover:text-[#E8C06A]"
                    style={{ fontFamily: '"Cormorant Garamond", serif', color: '#D4A34F' }}
                  >
                    {station.number}
                  </span>
                  <span className="text-xs leading-tight line-clamp-2 px-1" style={{ color: '#C8A882' }}>
                    {lang === 'kn' && station.title_kn ? station.title_kn :
                     lang === 'hi' && station.title_hi ? station.title_hi :
                     station.title || `Station ${station.number}`}
                  </span>
                  {station.audio_url ? (
                    <span className="absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity text-sm" style={{ color: '#E8C06A' }}>
                      &#9654;
                    </span>
                  ) : (
                    <svg className="absolute bottom-2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(155,138,114,0.4)" strokeWidth="2">
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
      <footer className="px-6 py-5 text-center relative z-10">
        <div className="h-px mb-4" style={{
          background: 'linear-gradient(to right, transparent, rgba(212,163,79,0.12) 20%, rgba(212,163,79,0.12) 80%, transparent)',
        }} />
        <p className="text-xs italic" style={{ fontFamily: '"Cormorant Garamond", serif', color: 'rgba(212,163,79,0.3)' }}>
          &ldquo;Arise, awake, and stop not till the goal is reached.&rdquo;
        </p>
        <p className="text-[10px] mt-2" style={{ color: 'rgba(155,138,114,0.4)' }}>
          Swami Vivekananda Smriti &middot; Ramakrishna Ashram, Mysore
        </p>
      </footer>
    </div>
  );
}
