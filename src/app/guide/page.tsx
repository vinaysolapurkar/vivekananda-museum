"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Lang = "en" | "kn" | "hi";

const langLabels: Record<Lang, string> = {
  en: "English",
  kn: "ಕನ್ನಡ",
  hi: "हिन्दी",
};

interface Station {
  number: number;
  title: string;
  gallery_zone: string;
}

export default function GuidePage() {
  const [lang, setLang] = useState<Lang>("en");
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/audio/stations?lang=${lang}`)
      .then((r) => r.json())
      .then((data) => setStations(data.stations || []))
      .catch(() => setStations([]))
      .finally(() => setLoading(false));
  }, [lang]);

  // Generate a 1-50 grid even if stations aren't created yet
  const grid = Array.from({ length: 50 }, (_, i) => {
    const num = i + 1;
    const station = stations.find((s) => s.number === num);
    return { number: num, title: station?.title, exists: !!station };
  });

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary text-text-light px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link href="/" className="text-saffron text-2xl">
            ←
          </Link>
          <h1 className="text-lg font-heading font-semibold">Audio Guide</h1>
          <div className="w-8" />
        </div>
      </header>

      {/* Language Selector */}
      <div className="flex gap-3 justify-center p-4 bg-white border-b border-border">
        {(Object.keys(langLabels) as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`touch-target px-6 py-3 rounded-xl text-base font-semibold transition-all ${
              lang === l
                ? "bg-primary text-text-light shadow-md"
                : "bg-surface text-text-dark border border-border hover:border-primary"
            }`}
          >
            {langLabels[l]}
          </button>
        ))}
      </div>

      {/* Station Grid */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {grid.map((item) => (
              <Link
                key={item.number}
                href={`/guide/${item.number}?lang=${lang}`}
                className={`touch-target aspect-square rounded-xl flex flex-col items-center justify-center text-center transition-all font-semibold ${
                  item.exists
                    ? "bg-primary text-text-light shadow-sm hover:bg-primary-light active:scale-95"
                    : "bg-white border border-border text-text-muted hover:border-primary/30"
                }`}
              >
                <span className="text-xl">{item.number}</span>
                {item.title && (
                  <span className="text-[9px] leading-tight mt-0.5 px-1 opacity-80 line-clamp-2">
                    {item.title}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer hint */}
      <div className="bg-white border-t border-border p-4 text-center text-sm text-text-muted">
        Tap a station number to hear the audio guide
      </div>
    </div>
  );
}
