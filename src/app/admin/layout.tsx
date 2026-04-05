"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/slideshow", label: "Slideshow", icon: "🖼" },
  { href: "/admin/stations", label: "Audio Stations", icon: "🎧" },
  { href: "/admin/knowledge", label: "Chat Knowledge", icon: "📚" },
  { href: "/admin/quiz", label: "Quiz Manager", icon: "📝" },
  { href: "/admin/map", label: "Travel Map", icon: "🗺" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
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
      <div className="admin-light flex items-center justify-center min-h-screen" style={{ background: '#FFF8F0', color: '#2C1810' }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E07B2E', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-light flex items-center justify-center min-h-screen" style={{ background: '#FFF8F0', color: '#2C1810' }}>
        <div className="rounded-2xl shadow-lg p-8 w-full max-w-sm text-center" style={{ background: 'white', border: '1px solid #E8D8C8' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4" style={{ background: '#7B2D26', color: 'white' }}>
            🔐
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2C1810' }}>Admin Access</h1>
          <p className="text-sm mb-6" style={{ color: '#8B7B6B' }}>Enter 6-digit PIN</p>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && pin.length === 6 && login()}
            placeholder="• • • • • •"
            className="w-full px-4 py-3 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:outline-none mb-4"
            style={{ border: '2px solid #E8D8C8', color: '#2C1810', background: 'white' }}
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            onClick={login}
            disabled={pin.length !== 6 || loggingIn}
            className="w-full py-3 rounded-xl font-semibold disabled:opacity-40 transition-colors"
            style={{ background: '#7B2D26', color: 'white' }}
          >
            {loggingIn ? "Verifying..." : "Login"}
          </button>
          <Link href="/" className="text-sm mt-4 inline-block" style={{ color: '#8B7B6B' }}>
            ← Back to Museum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-light flex min-h-screen" style={{ background: '#FFF8F0', color: '#2C1810' }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform md:translate-x-0 md:static md:shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: '#7B2D26' }}
      >
        <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 className="font-bold text-lg" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FFF8F0' }}>Museum Admin</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,248,240,0.5)' }}>Viveka Smaraka</p>
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
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: active ? '#FFF8F0' : 'rgba(255,248,240,0.6)',
                }}
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
            className="w-full py-2 text-sm rounded-lg transition-colors"
            style={{ color: 'rgba(255,248,240,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b px-4 py-3 flex items-center gap-3 md:hidden" style={{ background: 'white', borderColor: '#E8D8C8' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ background: '#FFF8F0', color: '#2C1810' }}
          >
            ☰
          </button>
          <h2 className="font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#2C1810' }}>Admin</h2>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
