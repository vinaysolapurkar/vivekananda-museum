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
        .register("/sw.js", { scope: "/" })
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

    // Check if already cached
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

// Install prompt banner
export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [show, setShow] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone)
    );
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone || dismissed) return null;

  // iOS: show tap-to-install instructions
  if (isIOS && !show) {
    return (
      <div
        className="mx-4 mb-4 rounded-xl p-3 flex items-center gap-3 animate-fade-in-up"
        style={{
          background: "rgba(212,163,79,0.1)",
          border: "1px solid rgba(212,163,79,0.2)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A34F" strokeWidth="1.5">
          <path d="M12 5v14M5 12l7-7 7 7" />
        </svg>
        <div className="flex-1">
          <p className="text-xs font-medium" style={{ color: "#E8B84B" }}>
            Install Audio Guide
          </p>
          <p className="text-[10px]" style={{ color: "#8B8FA3" }}>
            Tap Share then &ldquo;Add to Home Screen&rdquo;
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="p-1" style={{ color: "#8B8FA3" }}>
          &times;
        </button>
      </div>
    );
  }

  // Android/desktop: use beforeinstallprompt
  if (!show) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as unknown as { prompt: () => void }).prompt();
    setShow(false);
    setDeferredPrompt(null);
  };

  return (
    <div
      className="mx-4 mb-4 rounded-xl p-3 flex items-center gap-3 animate-fade-in-up"
      style={{
        background: "rgba(212,163,79,0.1)",
        border: "1px solid rgba(212,163,79,0.2)",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A34F" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M12 3v12M8 7l4-4 4 4" />
      </svg>
      <div className="flex-1">
        <p className="text-xs font-medium" style={{ color: "#E8B84B" }}>
          Install Audio Guide
        </p>
        <p className="text-[10px]" style={{ color: "#8B8FA3" }}>
          Works offline after install
        </p>
      </div>
      <button
        onClick={handleInstall}
        className="px-3 py-1.5 rounded-lg text-xs font-medium"
        style={{ background: "rgba(212,163,79,0.2)", color: "#E8B84B", border: "1px solid rgba(212,163,79,0.3)" }}
      >
        Install
      </button>
      <button onClick={() => setDismissed(true)} className="p-1" style={{ color: "#8B8FA3" }}>
        &times;
      </button>
    </div>
  );
}

// Offline indicator bar
export function OfflineIndicator({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;
  return (
    <div
      className="text-center text-xs py-1.5 font-medium"
      style={{ background: "#7B2D26", color: "#FFF8F0" }}
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
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: "rgba(91,123,94,0.15)", color: "#7A9E7D", border: "1px solid rgba(91,123,94,0.2)" }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Offline Ready
    </span>
  );
}
