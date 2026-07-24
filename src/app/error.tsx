"use client";

import { useEffect } from "react";

/**
 * Branded route-level error boundary (App Router auto-detected). Catches
 * errors thrown during server rendering / routing that the React
 * ErrorBoundary in AppShell cannot reach. Offers reset() to retry in place
 * and a hard "Return home" fallback — important for an unattended kiosk.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Otherwise invisible on a kiosk with no attendant.
    console.error("[route error]", error);
  }, [error]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center text-center px-8 z-[9998]"
      style={{ background: "var(--background)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--diya-glow)" }}
      />
      <div className="relative z-10 max-w-md">
        <div className="m-divider mb-6"><span>✦</span></div>
        <h1
          className="text-4xl mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--ivory)" }}
        >
          Something went wrong
        </h1>
        <p className="text-base mb-8" style={{ color: "var(--ink-muted)" }}>
          This screen hit a snag. Try again, or return home.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => reset()} className="m-btn m-btn-primary">
            Try again
          </button>
          <button
            onClick={() => { window.location.href = "/"; }}
            className="m-btn m-btn-ghost"
          >
            Return home
          </button>
        </div>
      </div>
    </div>
  );
}
