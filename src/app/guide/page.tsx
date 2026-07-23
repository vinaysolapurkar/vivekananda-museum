"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import MuseumIcon from "@/components/MuseumIcon";
import { useServiceWorker, InstallBanner, OfflineIndicator } from "./pwa";

type Lang = "en" | "kn" | "hi";

const langLabels: Record<Lang, string> = {
  en: "English",
  kn: "ಕನ್ನಡ",
  hi: "हिन्दी",
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
    <div className="flex flex-col min-h-screen relative" style={{ background: "var(--background)" }}>
      {/* Vivekananda portrait — sepia presence on the right */}
      <div
        className="fixed top-0 right-0 bottom-0 w-[45%] pointer-events-none z-0 opacity-[0.06]"
        style={{
          backgroundImage: "url(/images/vivekananda-portrait.jpg)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right top",
          backgroundSize: "auto 80%",
          maskImage: "linear-gradient(to left, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
          filter: "sepia(0.4) brightness(1.15)",
        }}
      />

      <OfflineIndicator isOnline={isOnline} />
      <InstallBanner />

      {/* Hero band */}
      <header className="relative overflow-hidden z-10" style={{ background: "var(--bg-hero)", borderBottom: "1px solid var(--hairline)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--diya-glow)" }} />
        <div className="relative mx-auto w-full max-w-6xl px-6 pt-6 pb-8">
          <Link href="/" className="m-btn m-btn-ghost touch-target mb-6 !px-4 text-sm">
            <MuseumIcon name="arrowLeft" size={17} />
            <span>Home</span>
          </Link>
          <p className="m-eyebrow mb-2">Ramakrishna Ashram &middot; Mysore</p>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-medium" style={{ color: "var(--ivory)" }}>
              Audio Guide
            </h1>
          </div>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-muted)" }}>
            Guided narration through the gallery, station by station
          </p>
        </div>
      </header>

      {/* Language picker */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-6">
        <p className="m-eyebrow mb-3">Select Language</p>
        <div className="flex gap-2.5">
          {(Object.keys(langLabels) as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`m-chip touch-target flex-1 justify-center sm:flex-none sm:min-w-[8.5rem] ${lang === l ? "m-chip-active" : ""}`}
              style={l !== "en" ? { fontFamily: "var(--font-kannada)" } : undefined}
            >
              {langLabels[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Zone filter — sticky */}
      {zones.length > 1 && (
        <div
          className="sticky top-0 z-20 mt-5 py-3"
          style={{
            background: "rgba(20, 16, 13, 0.88)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <div className="mx-auto w-full max-w-6xl px-6 flex gap-2 overflow-x-auto kiosk-scroll">
            {zones.map(zone => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`m-chip shrink-0 ${selectedZone === zone ? "m-chip-active" : ""}`}
              >
                {zone === "all" ? "All Zones" : zone}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 relative z-10 mx-auto w-full max-w-6xl px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--gold)" }} />
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Loading guide&hellip;</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <p style={{ color: "var(--ink-muted)" }}>{error}</p>
            <button onClick={fetchStations} className="m-btn m-btn-ghost touch-target">
              Try Again
            </button>
          </div>
        ) : stations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-2" style={{ border: "1px solid var(--hairline-strong)" }}>
              <img src="/images/vivekananda-portrait.jpg" alt="" className="w-full h-full object-cover" style={{ opacity: 0.5, filter: "sepia(0.3)" }} />
            </div>
            <h2 className="text-2xl font-medium" style={{ color: "var(--ivory)" }}>No Stations Yet</h2>
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              The audio guide content is being prepared. Please check back soon.
            </p>
            <Link href="/" className="m-btn m-btn-ghost touch-target mt-3">
              <MuseumIcon name="arrowLeft" size={17} />
              Return Home
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between mb-5">
              <p className="m-eyebrow" style={{ color: "var(--ink-muted)" }}>
                {filtered.length} Station{filtered.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs" style={{ color: "var(--ink-faint)" }}>Tap a station to listen</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filtered.map((station, idx) => (
                <Link
                  key={station.number}
                  href={`/guide/${station.number}?lang=${lang}`}
                  className="m-card m-card-interactive group relative flex flex-col items-center justify-between text-center px-3 pt-6 pb-4 animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(idx * 25, 400)}ms`, minHeight: "148px" }}
                >
                  {station.gallery_zone && (
                    <span
                      className="text-[9px] font-semibold uppercase truncate max-w-full px-1"
                      style={{ letterSpacing: "0.18em", color: "var(--ink-faint)" }}
                    >
                      {station.gallery_zone}
                    </span>
                  )}
                  <span
                    className="text-[2.6rem] leading-none font-medium transition-colors"
                    style={{ fontFamily: "var(--font-display)", color: "var(--gold)" }}
                  >
                    {station.number}
                  </span>
                  <span
                    className="text-xs leading-snug w-full transition-colors group-hover:!text-[var(--ivory)]"
                    style={{
                      color: "var(--ink-muted)",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      ...(lang !== "en" ? { fontFamily: "var(--font-kannada)" } : {}),
                    } as React.CSSProperties}
                  >
                    {lang === "kn" && station.title_kn ? station.title_kn :
                     lang === "hi" && station.title_hi ? station.title_hi :
                     station.title || `Station ${station.number}`}
                  </span>
                  <span
                    className="mt-2 inline-flex items-center justify-center w-7 h-7 rounded-full transition-all"
                    style={{
                      border: "1px solid var(--hairline)",
                      color: station.audio_url ? "var(--gold)" : "var(--ink-faint)",
                    }}
                  >
                    <MuseumIcon name={station.audio_url ? "play" : "headphones"} size={13} strokeWidth={1.8} />
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 pt-2 pb-8 text-center">
        <div className="m-divider mb-5"><span>&#10022;</span></div>
        <p className="text-sm italic" style={{ fontFamily: "var(--font-display)", color: "var(--ink-muted)" }}>
          &ldquo;Arise, awake, and stop not till the goal is reached.&rdquo;
        </p>
        <p className="text-[11px] mt-2" style={{ color: "var(--ink-faint)" }}>
          Swami Viveka Smaraka &middot; Ramakrishna Ashram, Mysore
        </p>
      </footer>
    </div>
  );
}
