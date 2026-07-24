/**
 * Global route loading fallback (App Router auto-detected).
 * Shown during server navigation / data fetches. Server-component-safe:
 * no hooks, no client JS — just a calm branded splash with the diya glow.
 */
export default function Loading() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center text-center px-8 z-[9990]"
      style={{ background: "var(--background)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--diya-glow)" }}
      />
      <div className="relative z-10 flex flex-col items-center">
        {/* Diya flame — gently pulsing lamp light */}
        <div
          className="animate-pulse"
          style={{ color: "var(--saffron)", filter: "drop-shadow(0 0 18px rgba(224,123,46,0.55))" }}
        >
          <svg width="46" height="46" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2c0 3-3 4.5-3 8a3 3 0 0 0 6 0c0-2-1.2-3-1.2-4.5 1.6.8 2.2 2.4 2.2 4.2A6 6 0 1 1 9 4.2C10 3 12 2.6 12 2Z" />
          </svg>
        </div>
        <div className="m-divider mt-6 mb-4" style={{ width: "10rem" }}>
          <span>✦</span>
        </div>
        <p
          className="text-lg animate-pulse"
          style={{ fontFamily: "var(--font-display)", color: "var(--ivory)", letterSpacing: "0.02em" }}
        >
          Loading…
        </p>
      </div>
    </div>
  );
}
