"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/slideshow", label: "Slideshow", icon: "🖼️" },
  { href: "/admin/stations", label: "Audio Stations", icon: "🎧" },
  { href: "/admin/knowledge", label: "Chat Knowledge", icon: "📚" },
  { href: "/admin/quiz", label: "Quiz Manager", icon: "📝" },
  { href: "/admin/map", label: "Travel Map", icon: "🗺️" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
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
      if (data.success) {
        setAuthenticated(true);
      } else {
        setError(data.error || "Invalid PIN");
      }
    } catch {
      setError("Login failed");
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setPin("");
  };

  if (authenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-4">
            🔐
          </div>
          <h1 className="text-xl font-heading font-bold text-primary mb-1">Admin Access</h1>
          <p className="text-sm text-text-muted mb-6">Enter 6-digit PIN</p>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && pin.length === 6 && login()}
            placeholder="• • • • • •"
            className="w-full px-4 py-3 border border-border rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-primary mb-4"
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            onClick={login}
            disabled={pin.length !== 6 || loggingIn}
            className="w-full py-3 bg-primary text-text-light rounded-xl font-semibold disabled:opacity-40 hover:bg-primary-light transition-colors"
          >
            {loggingIn ? "Verifying..." : "Login"}
          </button>
          <Link href="/" className="text-sm text-text-muted hover:text-primary mt-4 inline-block">
            ← Back to Museum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary transform transition-transform md:translate-x-0 md:static md:shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-white/10">
          <h1 className="text-text-light font-heading font-bold text-lg">Museum Admin</h1>
          <p className="text-text-light/50 text-xs mt-0.5">Vivekananda Smriti</p>
        </div>
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/15 text-text-light"
                    : "text-text-light/60 hover:bg-white/10 hover:text-text-light"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={logout}
            className="w-full py-2 text-sm text-text-light/50 hover:text-text-light border border-white/10 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-xl"
          >
            ☰
          </button>
          <h2 className="font-heading font-semibold text-primary">Admin</h2>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
