"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Lang = "en" | "kn" | "hi";

const langLabels: Record<Lang, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  kn: { label: "ಕನ್ನಡ", flag: "🇮🇳" },
  hi: { label: "हिन्दी", flag: "🇮🇳" },
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

  const zones = ["all", ...Array.from(new Set(stations.map(s => s.gallery_zone).filter(Boolean)))];

  const filtered = selectedZone === "all" ? stations : stations.filter(s => s.gallery_zone === selectedZone);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#FAFAF7' }}>
      {/* Header */}
      <header 
        className="relative overflow-hidden px-6 py-8 text-white"
        style={{ background: 'linear-gradient(135deg, #1A237E 0%, #283593 60%, #1A237E 100%)' }}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-saffron hover:text-white transition-colors mb-4 text-sm font-medium">
            <span>←</span> <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-saffron/20 flex items-center justify-center text-2xl">🎧</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Audio Guide</h1>
              <p className="text-white/70 text-sm">Ramakrishna Ashram, Mysore</p>
            </div>
          </div>
        </div>
      </header>

      {/* Language Selector */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Select Language</p>
          <div className="flex gap-3">
            {(Object.keys(langLabels) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-base font-semibold transition-all duration-200 border-2"
                style={{
                  background: lang === l ? '#1A237E' : '#FFFFFF',
                  color: lang === l ? '#FFFFFF' : '#1A237E',
                  borderColor: lang === l ? '#1A237E' : '#E5E7EB',
                  boxShadow: lang === l ? '0 4px 14px rgba(26,35,126,0.25)' : 'none',
                }}
              >
                <span>{langLabels[l].flag}</span>
                <span>{langLabels[l].label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Zone Filter */}
      {zones.length > 1 && (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto pb-1">
            {zones.map(zone => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  background: selectedZone === zone ? '#FF8F00' : '#F3F4F6',
                  color: selectedZone === zone ? '#FFFFFF' : '#374151',
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
            <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-gray-500 font-medium">Loading guide...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="text-4xl">⚠️</div>
            <p className="text-gray-500 font-medium">{error}</p>
            <button 
              onClick={fetchStations}
              className="px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: '#1A237E' }}
            >
              Try Again
            </button>
          </div>
        ) : stations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="text-5xl mb-2">🖼️</div>
            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>No Stations Yet</h2>
            <p className="text-gray-500 max-w-xs">The audio guide content is being prepared. Please check back soon.</p>
            <Link href="/" className="mt-4 px-6 py-3 rounded-xl font-semibold text-white" style={{ background: '#1A237E' }}>
              Return Home
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 mt-2">
              <p className="text-sm text-gray-500">
                {filtered.length} station{filtered.length !== 1 ? 's' : ''} available
              </p>
              <p className="text-xs text-gray-400">Tap to listen</p>
            </div>

            <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
              {filtered.map((station, idx) => (
                <Link
                  key={station.number}
                  href={`/guide/${station.number}?lang=${lang}`}
                  className="group relative bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-lg hover:border-saffron/40 active:scale-95"
                  style={{
                    animationDelay: `${idx * 30}ms`,
                  }}
                >
                  {station.gallery_zone && (
                    <span 
                      className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#FFF3E0', color: '#E65100' }}
                    >
                      {station.gallery_zone}
                    </span>
                  )}
                  <span 
                    className="text-3xl font-bold mb-1 transition-colors"
                    style={{ fontFamily: 'Playfair Display, serif', color: '#1A237E' }}
                  >
                    {station.number}
                  </span>
                  <span className="text-xs text-gray-600 leading-tight line-clamp-2 px-1">
                    {lang === 'kn' && station.title_kn ? station.title_kn : 
                     lang === 'hi' && station.title_hi ? station.title_hi : 
                     station.title || `Station ${station.number}`}
                  </span>
                  {station.audio_url ? (
                    <span className="absolute bottom-2 text-saffron opacity-0 group-hover:opacity-100 transition-opacity text-lg">▶</span>
                  ) : (
                    <span className="absolute bottom-2 text-gray-300 text-xs">🔒</span>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-6 py-4 text-center">
        <p className="text-xs text-gray-400">
          Swami Vivekananda Smriti • Ramakrishna Ashram, Mysore
        </p>
      </footer>
    </div>
  );
}
