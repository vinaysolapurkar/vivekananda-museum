"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  stations: number;
  kiosks: number;
  questions: number;
  attempts_today: number;
  chat_sessions: number;
}

const cards = [
  { key: "stations" as const, label: "Audio Stations", icon: "🎧", href: "/admin/stations", color: "bg-primary" },
  { key: "kiosks" as const, label: "Kiosks", icon: "🖥️", href: "/admin/kiosks", color: "bg-saffron" },
  { key: "questions" as const, label: "Quiz Questions", icon: "📝", href: "/admin/quiz", color: "bg-accent" },
  { key: "attempts_today" as const, label: "Attempts Today", icon: "📊", href: "/admin/quiz", color: "bg-primary-light" },
  { key: "chat_sessions" as const, label: "Chat Sessions", icon: "💬", href: "/admin/knowledge", color: "bg-saffron-dark" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-heading font-bold text-primary mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="bg-white rounded-xl border border-border p-4 hover:shadow-md hover:border-saffron/30 transition-all"
          >
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-lg mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-text-dark">
              {stats ? stats[card.key] : "—"}
            </p>
            <p className="text-xs text-text-muted mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-heading font-semibold text-primary mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/admin/stations"
          className="flex items-center gap-3 bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
        >
          <span className="text-2xl">➕</span>
          <div>
            <p className="font-semibold text-text-dark">Add Station</p>
            <p className="text-xs text-text-muted">Create a new audio station</p>
          </div>
        </Link>
        <Link
          href="/admin/kiosks"
          className="flex items-center gap-3 bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
        >
          <span className="text-2xl">➕</span>
          <div>
            <p className="font-semibold text-text-dark">Add Kiosk</p>
            <p className="text-xs text-text-muted">Set up a new kiosk display</p>
          </div>
        </Link>
        <Link
          href="/admin/knowledge"
          className="flex items-center gap-3 bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
        >
          <span className="text-2xl">📄</span>
          <div>
            <p className="font-semibold text-text-dark">Upload PDF</p>
            <p className="text-xs text-text-muted">Add knowledge base document</p>
          </div>
        </Link>
        <Link
          href="/admin/quiz"
          className="flex items-center gap-3 bg-white border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
        >
          <span className="text-2xl">❓</span>
          <div>
            <p className="font-semibold text-text-dark">Add Question</p>
            <p className="text-xs text-text-muted">Create quiz questions</p>
          </div>
        </Link>
      </div>

      {/* Service health */}
      <h2 className="text-lg font-heading font-semibold text-primary mt-8 mb-3">Services</h2>
      <ServiceHealth />
    </div>
  );
}

function ServiceHealth() {
  const services = [
    { name: "Audio Guide", url: "/api/audio/health" },
    { name: "Kiosk Content", url: "/api/kiosk/health" },
    { name: "RAG Chatbot", url: "/api/chat/health" },
    { name: "Quiz Service", url: "/api/quiz/health" },
  ];
  const [health, setHealth] = useState<Record<string, boolean>>({});

  useEffect(() => {
    services.forEach((s) => {
      fetch(s.url)
        .then((r) => setHealth((prev) => ({ ...prev, [s.name]: r.ok })))
        .catch(() => setHealth((prev) => ({ ...prev, [s.name]: false })));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {services.map((s) => (
        <div
          key={s.name}
          className="bg-white border border-border rounded-xl p-3 flex items-center gap-2"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              health[s.name] === undefined
                ? "bg-border animate-pulse"
                : health[s.name]
                  ? "bg-accent"
                  : "bg-red-500"
            }`}
          />
          <span className="text-sm text-text-dark">{s.name}</span>
        </div>
      ))}
    </div>
  );
}
