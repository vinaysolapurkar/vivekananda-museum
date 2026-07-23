"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MuseumIcon from "@/components/MuseumIcon";

interface Kiosk {
  id: number;
  name: string;
  location: string;
  is_active: boolean;
}

export default function KioskListPage() {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/kiosk")
      .then((r) => r.json())
      .then((data) => setKiosks(data.kiosks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative" style={{ background: 'var(--background)' }}>
      {/* Vivekananda watermark */}
      <div className="fixed top-0 right-0 bottom-0 w-[40%] pointer-events-none z-0 opacity-[0.05]" style={{
        backgroundImage: 'url(/images/vivekananda-portrait.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right center',
        backgroundSize: 'auto 70%',
        maskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
        filter: 'sepia(0.4) brightness(1.2)',
      }} />

      <header className="relative z-10 overflow-hidden" style={{ background: 'var(--bg-hero)', borderBottom: '1px solid var(--hairline)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--diya-glow)' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="m-btn m-btn-ghost !min-h-[42px] !px-4 text-xs">
            <MuseumIcon name="arrowLeft" size={14} />
            Home
          </Link>
          <div className="text-center">
            <p className="m-eyebrow mb-1">Viveka Smaraka</p>
            <h1 className="text-2xl font-semibold leading-tight" style={{ color: 'var(--ivory)' }}>Kiosk Displays</h1>
          </div>
          <div className="w-[88px]" />
        </div>
      </header>

      <main className="flex-1 p-6 w-full max-w-4xl mx-auto relative z-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: 'var(--gold)' }} />
          </div>
        ) : kiosks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-5" style={{ border: '1.5px solid var(--hairline-strong)' }}>
              <img src="/images/vivekananda-portrait.jpg" alt="" className="w-full h-full object-cover" style={{ opacity: 0.5, filter: 'sepia(0.3)' }} />
            </div>
            <p className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ivory)' }}>No kiosks configured yet</p>
            <Link href="/admin/kiosks" className="text-sm hover:underline mt-2 inline-block" style={{ color: 'var(--gold)' }}>
              Set up kiosks in Admin
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {kiosks.map((k, idx) => (
              <Link
                key={k.id}
                href={`/kiosk/${k.id}`}
                className="m-card m-card-interactive block p-5 animate-fade-in-up"
                style={{ animationDelay: `${Math.min(idx * 60, 420)}ms` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(212,163,79,0.1)', color: 'var(--gold)', border: '1px solid var(--hairline)' }}>
                      <MuseumIcon name="gallery" size={20} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold leading-tight truncate" style={{ color: 'var(--ivory)' }}>{k.name}</h2>
                      {k.location && <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--ink-muted)' }}>{k.location}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full" style={{
                      background: k.is_active ? '#7A9E7D' : 'rgba(155,138,114,0.3)',
                      boxShadow: k.is_active ? '0 0 8px rgba(122,158,125,0.5)' : 'none',
                    }} />
                    <MuseumIcon name="arrowRight" size={16} style={{ color: 'var(--ink-faint)' }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
