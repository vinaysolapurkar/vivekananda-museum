"use client";

import { useState, useEffect, useCallback } from "react";

// Service worker registration + online/offline tracking
export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(true);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/guide" })
        .then(() => setSwReady(true))
        .catch((err) => console.error("SW registration failed:", err));
    }

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return { isOnline, swReady };
}

// Cache an audio URL via the service worker
export function useCacheAudio(audioUrl: string | undefined) {
  const [cached, setCached] = useState(false);

  useEffect(() => {
    if (!audioUrl || !("serviceWorker" in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (
        (event.data?.type === "AUDIO_CACHED" || event.data?.type === "AUDIO_CACHE_STATUS") &&
        event.data?.url === audioUrl
      ) {
        setCached(event.data.type === "AUDIO_CACHED" || event.data.cached);
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);

    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({ type: "CHECK_AUDIO_CACHED", url: audioUrl });
    });

    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [audioUrl]);

  const cacheNow = useCallback(() => {
    if (!audioUrl || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready.then((reg) => {
      reg.active?.postMessage({ type: "CACHE_AUDIO", url: audioUrl });
    });
  }, [audioUrl]);

  return { cached, cacheNow };
}

// Install prompt banner — ALWAYS shows on mobile unless dismissed
export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<{prompt: () => void} | null>(null);
  const [show, setShow] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone;
    if (standalone) { setIsStandalone(true); return; }

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt({ prompt: () => (e as any).prompt() });
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Auto-show after short delay
    const t = setTimeout(() => setShow(true), 2000);
    return () => { window.removeEventListener("beforeinstallprompt", handler); clearTimeout(t); };
  }, []);

  if (isStandalone || dismissed) return null;
  if (!show) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      const choiceResult = await (deferredPrompt as any).userChoice;
      if (choiceResult?.outcome === "accepted") setShow(false);
    } catch {
      setShow(false);
    }
  };

  return (
    <div
      className="relative z-20 mx-4 mt-4 rounded-2xl px-4 py-3.5 flex items-center gap-3.5"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--hairline)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ border: "1px solid var(--hairline-strong)", color: "var(--gold)", background: "var(--card-bg)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 13a8 8 0 0 1 16 0" />
          <path d="M4 13v4a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4Z" />
          <path d="M20 13v4a2 2 0 0 1-2 2h-1a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3Z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: "var(--ivory)" }}>
          Install Audio Guide
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>
          {isIOS ? "Tap Share → Add to Home Screen" : "Works offline after install"}
        </p>
      </div>
      {isIOS ? (
        <button
          onClick={() => setDismissed(true)}
          className="touch-target px-4 rounded-full text-xs font-semibold shrink-0"
          style={{ border: "1px solid var(--hairline)", color: "var(--gold)", background: "transparent" }}
        >
          Got it
        </button>
      ) : deferredPrompt ? (
        <button
          onClick={handleInstall}
          className="touch-target px-5 rounded-full text-sm font-semibold shrink-0"
          style={{
            background: "linear-gradient(180deg, #EE8A3C, #D96F24)",
            color: "#241305",
            boxShadow: "0 4px 18px rgba(224, 123, 46, 0.28)",
          }}
        >
          Install
        </button>
      ) : null}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="touch-target flex items-center justify-center shrink-0 rounded-full"
        style={{ color: "var(--ink-faint)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}

// Offline indicator bar
export function OfflineIndicator({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;
  return (
    <div
      className="relative z-20 text-center text-xs py-2.5 font-medium tracking-wide"
      style={{
        background: "var(--bg-raised)",
        color: "var(--gold)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      You are offline — cached content available
    </div>
  );
}

// Offline-ready badge
export function OfflineReadyBadge({ cached }: { cached: boolean }) {
  if (!cached) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{
        border: "1px solid var(--hairline)",
        color: "var(--gold)",
        background: "var(--card-bg)",
        letterSpacing: "0.04em",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m4 12.5 5 5L20 6.5" />
      </svg>
      Offline Ready
    </span>
  );
}
