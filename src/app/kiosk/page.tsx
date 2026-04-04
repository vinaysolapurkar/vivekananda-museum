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
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="bg-primary text-text-light px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Link href="/" className="text-saffron text-2xl">←</Link>
          <h1 className="text-lg font-heading font-semibold">Kiosk Displays</h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : kiosks.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p className="text-lg">No kiosks configured yet</p>
            <Link href="/admin/kiosks" className="text-primary hover:underline mt-2 inline-block">
              Set up kiosks in Admin
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {kiosks.map((k) => (
              <Link
                key={k.id}
                href={`/kiosk/${k.id}`}
                className="block bg-white border border-border rounded-xl p-5 hover:shadow-md hover:border-saffron/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-heading font-semibold text-primary">{k.name}</h2>
                    {k.location && <p className="text-sm text-text-muted mt-1">{k.location}</p>}
                  </div>
                  <span className={`w-3 h-3 rounded-full ${k.is_active ? "bg-accent" : "bg-border"}`} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
