"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import Link from "next/link";

interface Station {
  number: number;
  title: string;
  description: string;
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

  useEffect(() => {
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
    const onEnded = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, [station]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
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
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-6 text-center">
        <p className="text-xl text-text-muted mb-4">
          {error || "Station not found"}
        </p>
        <Link
          href={`/guide`}
          className="text-primary font-semibold hover:underline"
        >
          ← Back to stations
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary text-text-light px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link href="/guide" className="text-saffron text-2xl">
            ←
          </Link>
          <h1 className="text-lg font-heading font-semibold">
            Station {station.number}
          </h1>
          <div className="w-8" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {station.gallery_zone && (
          <span className="inline-block bg-saffron/10 text-saffron-dark px-3 py-1 rounded-full text-xs font-medium mb-3">
            {station.gallery_zone}
          </span>
        )}

        <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-4">
          {station.title}
        </h2>

        <div className="prose prose-lg text-text-dark leading-relaxed mb-8">
          <p>{station.description}</p>
        </div>
      </main>

      {/* Audio Player - fixed bottom */}
      <div className="sticky bottom-0 bg-white border-t border-border shadow-lg p-4">
        <div className="max-w-2xl mx-auto">
          {station.audio_url ? (
            <>
              <audio ref={audioRef} src={station.audio_url} preload="metadata" />

              {/* Progress */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-text-muted w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={seek}
                  className="audio-slider flex-1"
                />
                <span className="text-xs text-text-muted w-10">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => skip(-10)}
                  className="touch-target w-14 h-14 rounded-full bg-surface flex items-center justify-center text-primary font-bold text-sm hover:bg-border transition-colors"
                >
                  -10s
                </button>
                <button
                  onClick={togglePlay}
                  className="touch-target w-20 h-20 rounded-full bg-saffron text-white flex items-center justify-center text-3xl shadow-lg hover:bg-saffron-dark transition-colors active:scale-95"
                >
                  {playing ? "⏸" : "▶"}
                </button>
                <button
                  onClick={() => skip(10)}
                  className="touch-target w-14 h-14 rounded-full bg-surface flex items-center justify-center text-primary font-bold text-sm hover:bg-border transition-colors"
                >
                  +10s
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-text-muted py-4">
              No audio available for this station
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
