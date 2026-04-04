"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import Link from "next/link";

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
    if (!started) setStarted(true);
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
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#FAFAF7' }}>
        <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading station...</p>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#FAFAF7' }}>
        <div className="text-5xl mb-4">🖼️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          Station Not Found
        </h2>
        <p className="text-gray-500 mb-6">{error || "This station does not exist."}</p>
        <Link href="/guide" className="px-6 py-3 rounded-2xl font-semibold text-white" style={{ background: '#1A237E' }}>
          ← Back to Guide
        </Link>
      </div>
    );
  }

  const title = lang === 'kn' && station.title_kn ? station.title_kn :
                lang === 'hi' && station.title_hi ? station.title_hi : station.title;
  const description = lang === 'kn' && station.description_kn ? station.description_kn :
                      lang === 'hi' && station.description_hi ? station.description_hi : station.description;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAFAF7' }}>
      {/* Header */}
      <header 
        className="relative px-6 pt-8 pb-6 text-white overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1A237E 0%, #3949AB 100%)' }}
      >
        {/* Decorative lotus */}
        <div className="absolute right-4 top-4 opacity-5 text-9xl select-none">✦</div>
        
        <Link href="/guide" className="inline-flex items-center gap-2 text-saffron hover:text-white transition-colors mb-6 text-sm font-medium">
          <span>←</span> <span>All Stations</span>
        </Link>
        
        <div className="relative">
          {station.gallery_zone && (
            <span className="inline-block text-xs font-semibold tracking-wider uppercase mb-3 px-3 py-1 rounded-full bg-white/15 text-white/80">
              {station.gallery_zone}
            </span>
          )}
          <div className="flex items-end gap-4 mb-2">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, #FF8F00, #FF6F00)',
                fontFamily: 'Playfair Display, serif',
              }}
            >
              {station.number}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                {title}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Description */}
      <main className="flex-1 px-6 py-6 max-w-2xl mx-auto w-full">
        <div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
          style={{ borderLeft: '4px solid #FF8F00' }}
        >
          <p className="text-gray-700 leading-relaxed text-base" style={{ lineHeight: '1.8' }}>
            {description}
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="text-2xl mb-1">🎧</div>
            <p className="text-xs text-gray-500">Audio Guide</p>
            <p className="text-sm font-semibold text-gray-800">{station.number} of 50</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="text-2xl mb-1">📍</div>
            <p className="text-xs text-gray-500">Gallery</p>
            <p className="text-sm font-semibold text-gray-800">{station.gallery_zone || 'Main Hall'}</p>
          </div>
        </div>

        {/* Inspirational quote */}
        <div className="bg-gradient-to-r from-primary/5 to-saffron/5 rounded-2xl p-5 text-center">
          <p className="italic text-gray-700 text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>
            "You have to grow from the inside out. None can teach you, none can make you spiritual."
          </p>
          <p className="text-xs text-gray-400 mt-2">— Swami Vivekananda</p>
        </div>
      </main>

      {/* Audio Player - fixed bottom */}
      <div 
        className="sticky bottom-0 shadow-2xl"
        style={{ 
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 20%)',
          paddingBottom: '0'
        }}
      >
        <div className="bg-white mx-4 mb-4 rounded-2xl p-5 border border-gray-100">
          {station.audio_url ? (
            <>
              <audio ref={audioRef} src={station.audio_url} preload="metadata" />

              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-gray-400 font-mono w-10 text-right shrink-0">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 relative">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                        background: 'linear-gradient(90deg, #1A237E, #3949AB)'
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
                <span className="text-xs text-gray-400 font-mono w-10 shrink-0">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-5">
                <button
                  onClick={() => skip(-10)}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs hover:bg-gray-200 transition-colors active:scale-95"
                >
                  -10
                </button>
                
                <button
                  onClick={togglePlay}
                  className="w-18 h-18 rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition-all active:scale-95"
                  style={{ 
                    background: started 
                      ? (playing ? 'linear-gradient(135deg, #1A237E, #3949AB)' : 'linear-gradient(135deg, #FF8F00, #FF6F00)')
                      : 'linear-gradient(135deg, #FF8F00, #FF6F00)',
                    width: '72px',
                    height: '72px',
                  }}
                >
                  {playing ? '⏸' : '▶'}
                </button>
                
                <button
                  onClick={() => skip(10)}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs hover:bg-gray-200 transition-colors active:scale-95"
                >
                  +10
                </button>
              </div>

              {!started && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  ▶ Press play to start the audio guide
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-gray-500 text-sm">Audio for this station is being prepared</p>
              <p className="text-xs text-gray-400 mt-1">Check back soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
