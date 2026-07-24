import Link from "next/link";

/**
 * Branded 404 (App Router auto-detected). Server-component-safe.
 * Keeps an unattended kiosk on-brand instead of Next's default 404.
 */
export default function NotFound() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center text-center px-8 z-[9990]"
      style={{ background: "var(--background)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--diya-glow)" }}
      />
      <div className="relative z-10 max-w-md">
        <div className="m-divider mb-6"><span>✦</span></div>
        <p
          className="mb-2"
          style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", lineHeight: 1, color: "var(--gold)" }}
        >
          404
        </p>
        <h1
          className="text-3xl mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--ivory)" }}
        >
          Page not found
        </h1>
        <p className="text-base mb-8" style={{ color: "var(--ink-muted)" }}>
          This path does not exist. Return home to continue exploring.
        </p>
        <Link href="/" className="m-btn m-btn-primary">
          Return home
        </Link>
      </div>
    </div>
  );
}
