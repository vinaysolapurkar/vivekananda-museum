"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import MuseumIcon from "@/components/MuseumIcon";
import { useServiceWorker, useCacheAudio, OfflineIndicator, OfflineReadyBadge } from "../pwa";
import { useLang } from "@/components/LanguageProvider";
import type { Lang } from "@/lib/i18n";

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
  const { lang: ctxLang, setLang, t } = useLang();
  const urlLang = searchParams.get("lang");
  const lang: Lang = (urlLang === "kn" || urlLang === "hi" || urlLang === "en") ? urlLang : ctxLang;
  const kf = lang === "en" ? undefined : "var(--font-kannada)";

  // Keep global language in sync with the station URL param
  useEffect(() => {
    if ((urlLang === "kn" || urlLang === "hi" || urlLang === "en") && urlLang !== ctxLang) {
      setLang(urlLang);
    }
  }, [urlLang, ctxLang, setLang]);

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
      .catch(() => setError(t("guide.stationNotExist")))
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
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin mb-4" style={{ borderTopColor: "var(--gold)" }} />
        <p className="text-sm" style={{ color: "var(--ink-muted)", fontFamily: kf }}>{t("guide.loadingStation")}</p>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "var(--background)" }}>
        <h2 className="text-2xl font-medium mb-2" style={{ color: "var(--ivory)", fontFamily: kf }}>
          {t("guide.stationNotFound")}
        </h2>
        <p className="mb-7 text-sm" style={{ color: "var(--ink-muted)", fontFamily: kf }}>{error || t("guide.stationNotExist")}</p>
        <div className="flex items-center gap-3">
          <Link href="/guide" className="m-btn m-btn-ghost touch-target" style={{ fontFamily: kf }}>
            <MuseumIcon name="arrowLeft" size={17} />
            {t("guide.backToGuide")}
          </Link>
          <Link href="/" className="m-btn m-btn-ghost touch-target" style={{ fontFamily: kf }}>
            <MuseumIcon name="temple" size={17} />
            {t("common.home")}
          </Link>
        </div>
      </div>
    );
  }

  const title = lang === "kn" && station.title_kn ? station.title_kn :
                lang === "hi" && station.title_hi ? station.title_hi : station.title;
  const description = lang === "kn" && station.description_kn ? station.description_kn :
                      lang === "hi" && station.description_hi ? station.description_hi : station.description;
  const indicText = lang !== "en";
  const prevNumber = station.number > 1 ? station.number - 1 : null;
  const nextNumber = station.number + 1;

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "var(--background)" }}>
      {/* Vivekananda portrait — faint sepia presence */}
      <div
        className="fixed top-0 right-0 bottom-0 w-[40%] pointer-events-none z-0 opacity-[0.05]"
        style={{
          backgroundImage: "url(/images/vivekananda-portrait.jpg)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right top",
          backgroundSize: "auto 75%",
          maskImage: "linear-gradient(to left, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)",
          filter: "sepia(0.4) brightness(1.15)",
        }}
      />

      <OfflineIndicator isOnline={isOnline} />

      {/* Hero band */}
      <header className="relative overflow-hidden z-10" style={{ background: "var(--bg-hero)", borderBottom: "1px solid var(--hairline)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--diya-glow)" }} />
        <div className="relative mx-auto w-full max-w-3xl px-6 pt-6 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/guide" className="m-btn m-btn-ghost touch-target !px-4 text-sm">
              <MuseumIcon name="arrowLeft" size={17} />
              <span style={{ fontFamily: kf }}>{t("guide.allStations")}</span>
            </Link>
            <Link href="/" className="m-btn m-btn-ghost touch-target !px-4 text-sm">
              <MuseumIcon name="temple" size={17} />
              <span style={{ fontFamily: kf }}>{t("common.home")}</span>
            </Link>
          </div>

          <p className="m-eyebrow mb-3" style={{ fontFamily: kf }}>
            {station.gallery_zone || t("guide.mainHall")} &middot; {t("guide.station")} {station.number}
          </p>
          <div className="flex items-start gap-5">
            <div
              className="w-[4.5rem] h-[4.5rem] rounded-2xl flex items-center justify-center shrink-0 text-[2.4rem] font-medium leading-none"
              style={{
                fontFamily: "var(--font-display)",
                background: "var(--card-bg)",
                color: "var(--gold)",
                border: "1px solid var(--hairline-strong)",
              }}
            >
              {station.number}
            </div>
            <div className="min-w-0 pt-1">
              <h1
                className="text-3xl md:text-4xl font-medium leading-tight"
                style={{ color: "var(--ivory)", ...(indicText ? { fontFamily: "var(--font-kannada)" } : {}) }}
              >
                {title}
              </h1>
              <div className="mt-2">
                <OfflineReadyBadge cached={audioCached} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Description */}
      <main className="flex-1 relative z-10 mx-auto w-full max-w-3xl px-6 py-7 pb-52">
        {description && description.trim() && (
          <div className="m-card p-6 md:p-8 mb-6">
            <p
              className="text-base md:text-[1.05rem]"
              style={{ color: "var(--ivory)", opacity: 0.92, lineHeight: 1.85, ...(indicText ? { fontFamily: "var(--font-kannada)" } : {}) }}
            >
              {description}
            </p>
          </div>
        )}

        {/* Info row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <div className="m-card p-4 flex items-center gap-3.5">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ border: "1px solid var(--hairline)", color: "var(--gold)" }}>
              <MuseumIcon name="headphones" size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase whitespace-nowrap" style={{ letterSpacing: "0.16em", color: "var(--ink-faint)", fontFamily: kf }}>{t("mod.guide.title")}</p>
              <p className="text-sm font-medium" style={{ color: "var(--ivory)", fontFamily: kf }}>{t("guide.station")} {station.number} / 50</p>
            </div>
          </div>
          <div className="m-card p-4 flex items-center gap-3.5">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ border: "1px solid var(--hairline)", color: "var(--gold)" }}>
              <MuseumIcon name="temple" size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase whitespace-nowrap" style={{ letterSpacing: "0.16em", color: "var(--ink-faint)", fontFamily: kf }}>{t("guide.galleryLabel")}</p>
              <p className="text-sm font-medium" style={{ color: "var(--ivory)", fontFamily: kf }}>{station.gallery_zone || t("guide.mainHall")}</p>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="text-center px-4">
          <div className="m-divider mb-4"><span>&#10022;</span></div>
          <p className="italic text-base" style={{ fontFamily: "var(--font-display)", color: "var(--ink-muted)" }}>
            &ldquo;You have to grow from the inside out. None can teach you, none can make you spiritual.&rdquo;
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--ink-faint)" }}>&mdash; Swami Vivekananda</p>
        </div>
      </main>

      {/* Audio Player — fixed bottom */}
      <div className="fixed inset-x-0 bottom-0 z-30">
        <div
          className="absolute inset-x-0 bottom-0 h-36 pointer-events-none"
          style={{ background: "linear-gradient(to top, #14100D 30%, transparent)" }}
        />
        <div className="relative mx-auto w-full max-w-3xl px-4 pb-4">
          <div
            className="rounded-3xl p-5"
            style={{
              background: "rgba(29, 23, 18, 0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--hairline)",
              boxShadow: "0 -6px 40px rgba(0,0,0,0.45)",
            }}
          >
            {station.audio_url ? (
              <>
                <audio ref={audioRef} src={station.audio_url} preload="metadata" />

                {/* Progress */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs tabular-nums w-10 text-right shrink-0" style={{ color: "var(--ink-muted)" }}>
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 relative flex items-center" style={{ height: "20px" }}>
                    <div className="w-full h-[5px] rounded-full overflow-hidden" style={{ background: "rgba(212,163,79,0.14)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                          background: "linear-gradient(90deg, var(--saffron), var(--gold))",
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={seek}
                      aria-label="Seek"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-xs tabular-nums w-10 shrink-0" style={{ color: "var(--ink-muted)" }}>
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  {prevNumber ? (
                    <Link
                      href={`/guide/${prevNumber}?lang=${lang}`}
                      aria-label={t("guide.prevStation")}
                      className="m-btn m-btn-ghost touch-target !px-0 !min-w-[48px] rounded-full"
                    >
                      <MuseumIcon name="arrowLeft" size={18} />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full" style={{ border: "1px solid var(--hairline)", color: "var(--ink-faint)", opacity: 0.4 }}>
                      <MuseumIcon name="arrowLeft" size={18} />
                    </span>
                  )}

                  <button
                    onClick={() => skip(-10)}
                    aria-label="Back 10 seconds"
                    className="m-btn m-btn-ghost touch-target !px-0 !min-w-[52px] rounded-full text-xs font-semibold"
                  >
                    &minus;10
                  </button>

                  <button
                    onClick={togglePlay}
                    aria-label={playing ? "Pause" : "Play"}
                    className="m-btn m-btn-primary !rounded-full !p-0"
                    style={{ width: "76px", height: "76px", minHeight: "76px" }}
                  >
                    {playing ? (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
                        <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
                      </svg>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ marginLeft: "3px" }}>
                        <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => skip(10)}
                    aria-label="Forward 10 seconds"
                    className="m-btn m-btn-ghost touch-target !px-0 !min-w-[52px] rounded-full text-xs font-semibold"
                  >
                    +10
                  </button>

                  <Link
                    href={`/guide/${nextNumber}?lang=${lang}`}
                    aria-label={t("guide.nextStation")}
                    className="m-btn m-btn-ghost touch-target !px-0 !min-w-[48px] rounded-full"
                  >
                    <MuseumIcon name="arrowRight" size={18} />
                  </Link>
                </div>

                {!started && (
                  <p className="text-center text-xs mt-3.5" style={{ color: "var(--ink-faint)", fontFamily: kf }}>
                    {t("guide.pressPlay")}
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-1">
                <p className="m-eyebrow mb-4" style={{ fontFamily: kf }}>{t("guide.spokenNarration")}</p>
                <div className="flex items-center justify-center gap-4">
                  {prevNumber ? (
                    <Link
                      href={`/guide/${prevNumber}?lang=${lang}`}
                      aria-label={t("guide.prevStation")}
                      className="m-btn m-btn-ghost touch-target !px-0 !min-w-[48px] rounded-full"
                    >
                      <MuseumIcon name="arrowLeft" size={18} />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full" style={{ border: "1px solid var(--hairline)", color: "var(--ink-faint)", opacity: 0.4 }}>
                      <MuseumIcon name="arrowLeft" size={18} />
                    </span>
                  )}

                  <button
                    onClick={() => {
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(description);
                        utterance.lang = lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : "en-IN";
                        utterance.rate = 0.9;
                        utterance.onstart = () => setPlaying(true);
                        utterance.onend = () => setPlaying(false);
                        if (playing) {
                          window.speechSynthesis.cancel();
                          setPlaying(false);
                        } else {
                          window.speechSynthesis.speak(utterance);
                        }
                      }
                    }}
                    aria-label={playing ? "Stop" : "Play narration"}
                    className="m-btn m-btn-primary !rounded-full !p-0"
                    style={{ width: "76px", height: "76px", minHeight: "76px" }}
                  >
                    {playing ? (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
                        <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
                      </svg>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ marginLeft: "3px" }}>
                        <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                      </svg>
                    )}
                  </button>

                  <Link
                    href={`/guide/${nextNumber}?lang=${lang}`}
                    aria-label={t("guide.nextStation")}
                    className="m-btn m-btn-ghost touch-target !px-0 !min-w-[48px] rounded-full"
                  >
                    <MuseumIcon name="arrowRight" size={18} />
                  </Link>
                </div>
                <p className="text-xs mt-3.5" style={{ color: "var(--ink-faint)", fontFamily: kf }}>
                  {playing ? t("common.listening") : t("guide.tapToHear")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
