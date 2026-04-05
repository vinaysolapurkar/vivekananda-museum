"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import { useServiceWorker, useCacheAudio, OfflineIndicator, OfflineReadyBadge } from "../pwa";

interface Station {
  number: number;
  title: string;
  title_kn?: string;
  title_hi?: string;
  description: string;
  description_kn?: string;
  description_hi?: string;
  audio_url: string;
  gallery_zone: string;
}

export default function StationPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = use(params);
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") || "en";

  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [started, setStarted] = useState(false);

  const { isOnline } = useServiceWorker();
  const { cached: audioCached, cacheNow } = useCacheAudio(station?.audio_url);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/audio/stations/${number}?lang=${lang}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStation(data.station);
      })
      .catch(() => setError("Failed to load station"))
      .finally(() => setLoading(false));
  }, [number, lang]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    const onEnded = () => { setPlaying(false); setStarted(false); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, [station?.audio_url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !station?.audio_url) return;
    if (!started) {
      setStarted(true);
      cacheNow();
    }
    if (playing) { audio.pause(); } else { audio.play(); }
    setPlaying(!playing);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = parseFloat(e.target.value);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{
        background: 'linear-gradient(170deg, #1a0f0a 0%, #2a1810 30%, #1c1008 100%)',
      }}>
        <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin mb-4" style={{ borderTopColor: '#D4A34F' }} />
        <p className="text-sm" style={{ color: '#9B8A72' }}>Loading station...</p>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{
        background: 'linear-gradient(170deg, #1a0f0a 0%, #2a1810 30%, #1c1008 100%)',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9B8A72" strokeWidth="1" className="mb-4">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
        </svg>
        <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}>
          Station Not Found
        </h2>
        <p className="mb-6 text-sm" style={{ color: '#9B8A72' }}>{error || "This station does not exist."}</p>
        <Link
          href="/guide"
          className="px-6 py-3 rounded-xl font-medium text-sm"
          style={{ background: 'rgba(212,163,79,0.12)', color: '#D4A34F', border: '1px solid rgba(212,163,79,0.3)' }}
        >
          &larr; Back to Guide
        </Link>
      </div>
    );
  }

  const title = lang === 'kn' && station.title_kn ? station.title_kn :
                lang === 'hi' && station.title_hi ? station.title_hi : station.title;
  const description = lang === 'kn' && station.description_kn ? station.description_kn :
                      lang === 'hi' && station.description_hi ? station.description_hi : station.description;

  return (
    <div className="min-h-screen flex flex-col relative" style={{
      background: 'linear-gradient(170deg, #1a0f0a 0%, #2a1810 30%, #1c1008 100%)',
    }}>
      {/* Warm ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 70% 30%, rgba(212,163,79,0.05) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(123,45,38,0.06) 0%, transparent 50%)',
      }} />

      {/* Vivekananda portrait — fades in from the right */}
      <div className="fixed top-0 right-0 bottom-0 w-[40%] pointer-events-none z-0 opacity-[0.06]" style={{
        backgroundImage: 'url(/images/vivekananda-portrait.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right center',
        backgroundSize: 'auto 80%',
        maskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
        filter: 'sepia(0.4) brightness(1.2)',
      }} />

      <OfflineIndicator isOnline={isOnline} />

      {/* Header */}
      <header className="relative px-6 pt-8 pb-6 overflow-hidden z-10">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(123,45,38,0.12) 0%, transparent 100%)',
        }} />

        <div className="relative w-full">
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors duration-300 hover:opacity-80"
            style={{ color: '#D4A34F' }}
          >
            <span>&larr;</span> <span>All Stations</span>
          </Link>

          {station.gallery_zone && (
            <span
              className="inline-block text-[10px] font-medium tracking-[0.15em] uppercase mb-3 px-3 py-1 rounded-full"
              style={{ background: 'rgba(212,163,79,0.1)', color: '#C8A882', border: '1px solid rgba(212,163,79,0.15)' }}
            >
              {station.gallery_zone}
            </span>
          )}
          <div className="flex items-end gap-4 mb-2">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-semibold shrink-0"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                background: 'rgba(212,163,79,0.08)',
                color: '#E8C06A',
                border: '1px solid rgba(212,163,79,0.2)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              {station.number}
            </div>
            <div>
              <h1
                className="text-2xl md:text-3xl font-semibold leading-tight"
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  color: '#F5EDE0',
                  textShadow: '0 2px 12px rgba(0,0,0,0.3)',
                }}
              >
                {title}
              </h1>
              <OfflineReadyBadge cached={audioCached} />
            </div>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-6 right-6 h-px" style={{
          background: 'linear-gradient(to right, transparent, rgba(212,163,79,0.2) 20%, rgba(212,163,79,0.2) 80%, transparent)',
        }} />
      </header>

      {/* Description */}
      <main className="flex-1 px-6 py-6 w-full relative z-10">
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: 'rgba(255,245,230,0.04)',
            border: '1px solid rgba(212,163,79,0.1)',
            borderLeft: '3px solid rgba(212,163,79,0.35)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          }}
        >
          <p className="leading-relaxed text-base" style={{ color: '#D9CBBA', lineHeight: '1.8' }}>
            {description}
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(255,245,230,0.04)', border: '1px solid rgba(212,163,79,0.1)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4A34F" strokeWidth="1.5" className="mx-auto mb-1">
              <path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" />
            </svg>
            <p className="text-xs" style={{ color: '#9B8A72' }}>Audio Guide</p>
            <p className="text-sm font-medium" style={{ color: '#D9CBBA' }}>{station.number} of 50</p>
          </div>
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(255,245,230,0.04)', border: '1px solid rgba(212,163,79,0.1)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4A34F" strokeWidth="1.5" className="mx-auto mb-1">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <p className="text-xs" style={{ color: '#9B8A72' }}>Gallery</p>
            <p className="text-sm font-medium" style={{ color: '#D9CBBA' }}>{station.gallery_zone || 'Main Hall'}</p>
          </div>
        </div>

        {/* Inspirational quote */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: 'rgba(212,163,79,0.04)', border: '1px solid rgba(212,163,79,0.08)' }}
        >
          <p className="italic text-sm" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#C8A882' }}>
            &ldquo;You have to grow from the inside out. None can teach you, none can make you spiritual.&rdquo;
          </p>
          <p className="text-xs mt-2" style={{ color: '#9B8A72' }}>&mdash; Swami Vivekananda</p>
        </div>
      </main>

      {/* Audio Player - fixed bottom */}
      <div className="sticky bottom-0 z-20">
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #1a0f0a, transparent)' }}
        />
        <div
          className="relative mx-4 mb-4 rounded-2xl p-5"
          style={{
            background: 'rgba(26,15,10,0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,163,79,0.15)',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.3)',
          }}
        >
          {station.audio_url ? (
            <>
              <audio ref={audioRef} src={station.audio_url} preload="metadata" />

              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono w-10 text-right shrink-0" style={{ color: '#9B8A72' }}>
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 relative">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(212,163,79,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                        background: 'linear-gradient(90deg, #C8963E, #E8C06A)',
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={seek}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-xs font-mono w-10 shrink-0" style={{ color: '#9B8A72' }}>
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-5">
                <button
                  onClick={() => skip(-10)}
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 active:scale-95"
                  style={{ background: 'rgba(212,163,79,0.08)', color: '#C8A882', border: '1px solid rgba(212,163,79,0.15)' }}
                >
                  -10
                </button>

                <button
                  onClick={togglePlay}
                  className="flex items-center justify-center text-xl transition-all duration-300 active:scale-95"
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: started && playing
                      ? 'rgba(212,163,79,0.15)'
                      : 'rgba(212,163,79,0.1)',
                    color: '#E8C06A',
                    border: '2px solid rgba(212,163,79,0.35)',
                    boxShadow: playing ? '0 0 30px rgba(212,163,79,0.15)' : '0 4px 20px rgba(0,0,0,0.2)',
                  }}
                >
                  {playing ? '\u275A\u275A' : '\u25B6'}
                </button>

                <button
                  onClick={() => skip(10)}
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 active:scale-95"
                  style={{ background: 'rgba(212,163,79,0.08)', color: '#C8A882', border: '1px solid rgba(212,163,79,0.15)' }}
                >
                  +10
                </button>
              </div>

              {!started && (
                <p className="text-center text-xs mt-3" style={{ color: '#9B8A72' }}>
                  Press play to start the audio guide
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9B8A72" strokeWidth="1.5" className="mx-auto mb-2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <p className="text-sm" style={{ color: '#9B8A72' }}>Audio for this station is being prepared</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(155,138,114,0.5)' }}>Check back soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
