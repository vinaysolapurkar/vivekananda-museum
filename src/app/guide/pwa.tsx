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
      className="mx-4 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ background: "#7B2D26", color: "#FFF8F0", boxShadow: "0 4px 16px rgba(123,45,38,0.3)" }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: "rgba(255,248,240,0.15)" }}>
        🎧
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: "#FFF8F0" }}>
          Install Audio Guide
        </p>
        <p className="text-xs" style={{ color: "rgba(255,248,240,0.7)" }}>
          {isIOS ? "Tap Share → Add to Home Screen" : "Works offline after install"}
        </p>
      </div>
      {isIOS ? (
        <button
          onClick={() => setDismissed(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: "rgba(255,248,240,0.2)", color: "#FFF8F0" }}
        >
          Got it
        </button>
      ) : deferredPrompt ? (
        <button
          onClick={handleInstall}
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: "#E07B2E", color: "white" }}
        >
          Install
        </button>
      ) : null}
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-lg"
        style={{ color: "rgba(255,248,240,0.5)" }}
      >
        ×
      </button>
    </div>
  );
}

// Offline indicator bar
export function OfflineIndicator({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;
  return (
    <div className="text-center text-xs py-2 font-medium" style={{ background: "#C06520", color: "white" }}>
      You are offline — cached content available
    </div>
  );
}

// Offline-ready badge
export function OfflineReadyBadge({ cached }: { cached: boolean }) {
  if (!cached) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "#5B7B5E20", color: "#5B7B5E" }}
    >
      ✓ Offline Ready
    </span>
  );
}
