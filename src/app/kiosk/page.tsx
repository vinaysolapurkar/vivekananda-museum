"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    <div className="flex flex-col min-h-screen relative" style={{
      background: 'linear-gradient(170deg, #1a0f0a 0%, #2a1810 30%, #1c1008 100%)',
    }}>
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

      <header className="relative z-10 px-6 py-5" style={{
        background: 'rgba(58,26,18,0.4)',
        borderBottom: '1px solid rgba(212,163,79,0.1)',
      }}>
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: '#D4A34F' }}>← Home</Link>
          <h1 className="text-xl font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}>Kiosk Displays</h1>
          <div className="w-14" />
        </div>
      </header>

      <main className="flex-1 p-6 w-full relative z-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: '#D4A34F' }} />
          </div>
        ) : kiosks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4" style={{ border: '1.5px solid rgba(212,163,79,0.2)' }}>
              <img src="/images/vivekananda-portrait.jpg" alt="" className="w-full h-full object-cover" style={{ opacity: 0.5, filter: 'sepia(0.3)' }} />
            </div>
            <p className="text-lg" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#D9CBBA' }}>No kiosks configured yet</p>
            <Link href="/admin/kiosks" className="text-sm hover:underline mt-2 inline-block" style={{ color: '#D4A34F' }}>
              Set up kiosks in Admin
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {kiosks.map((k) => (
              <Link
                key={k.id}
                href={`/kiosk/${k.id}`}
                className="block rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'rgba(255,245,230,0.04)',
                  border: '1px solid rgba(212,163,79,0.1)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5EDE0' }}>{k.name}</h2>
                    {k.location && <p className="text-sm mt-1" style={{ color: '#9B8A72' }}>{k.location}</p>}
                  </div>
                  <span className="w-3 h-3 rounded-full" style={{ background: k.is_active ? '#7A9E7D' : 'rgba(155,138,114,0.3)' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
