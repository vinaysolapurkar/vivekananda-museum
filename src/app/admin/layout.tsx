"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MuseumIcon from "@/components/MuseumIcon";

function GearIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.85a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01A1.7 1.7 0 0 0 10.05 3V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01c.26.63.87 1.04 1.56 1.04H21a2 2 0 1 1 0 4h-.09c-.69 0-1.3.41-1.51 1.03Z" />
    </svg>
  );
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "temple" },
  { href: "/admin/slideshow", label: "Slideshow", icon: "gallery" },
  { href: "/admin/stations", label: "Audio Stations", icon: "headphones" },
  { href: "/admin/knowledge", label: "Chat Knowledge", icon: "lotus" },
  { href: "/admin/quiz", label: "Quiz Manager", icon: "scroll" },
  { href: "/admin/map", label: "Travel Map", icon: "globe" },
  { href: "/admin/settings", label: "Settings", icon: "gear" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => setAuthenticated(d.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  const login = async () => {
    setLoggingIn(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) setAuthenticated(true);
      else setError(data.error || "Invalid PIN");
    } catch { setError("Login failed"); }
    finally { setLoggingIn(false); }
  };

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setPin("");
  };

  if (authenticated === null) {
    return (
      <div className="admin-light flex items-center justify-center min-h-screen" style={{ background: "var(--background)" }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: "var(--saffron)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-light flex items-center justify-center min-h-screen px-4" style={{ background: "var(--bg-hero)" }}>
        <div className="m-card p-8 w-full max-w-sm text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(212, 163, 79, 0.1)", border: "1px solid var(--hairline-strong)", color: "var(--gold)" }}
          >
            <MuseumIcon name="temple" size={28} />
          </div>
          <p className="m-eyebrow mb-2">Viveka Smaraka</p>
          <h1 className="text-3xl mb-1" style={{ color: "var(--ivory)" }}>Admin Access</h1>
          <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>Enter 6-digit PIN</p>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && pin.length === 6 && login()}
            placeholder="• • • • • •"
            className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono mb-4"
          />
          {error && <p className="text-sm mb-3" style={{ color: "#D9776B" }}>{error}</p>}
          <button
            onClick={login}
            disabled={pin.length !== 6 || loggingIn}
            className="m-btn m-btn-primary w-full disabled:opacity-40"
          >
            {loggingIn ? "Verifying..." : "Login"}
          </button>
          <Link href="/" className="text-sm mt-5 inline-flex items-center gap-1.5" style={{ color: "var(--ink-muted)" }}>
            <MuseumIcon name="arrowLeft" size={14} /> Back to Museum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-light flex min-h-screen" style={{ background: "var(--background)", color: "var(--ivory)" }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform md:translate-x-0 md:static md:shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--bg-raised)", borderRight: "1px solid var(--hairline)" }}
      >
        <div className="p-5" style={{ borderBottom: "1px solid var(--hairline)" }}>
          <p className="m-eyebrow mb-1.5">Viveka Smaraka</p>
          <h1 className="text-2xl leading-none" style={{ color: "var(--ivory)" }}>Museum Admin</h1>
        </div>
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: active ? "var(--card-bg-hover)" : "transparent",
                  border: active ? "1px solid var(--hairline)" : "1px solid transparent",
                  color: active ? "var(--gold)" : "var(--ink-muted)",
                }}
              >
                <span style={{ color: active ? "var(--saffron)" : "var(--ink-faint)" }}>
                  {item.icon === "gear" ? <GearIcon size={18} /> : <MuseumIcon name={item.icon} size={18} />}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button onClick={logout} className="m-btn m-btn-ghost w-full" style={{ minHeight: 40, fontSize: "0.85rem" }}>
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="px-4 py-3 flex items-center gap-3 md:hidden"
          style={{ background: "var(--bg-raised)", borderBottom: "1px solid var(--hairline)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ background: "var(--card-bg)", border: "1px solid var(--hairline)", color: "var(--ivory)" }}
          >
            ☰
          </button>
          <h2 className="text-xl" style={{ color: "var(--ivory)" }}>Admin</h2>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
