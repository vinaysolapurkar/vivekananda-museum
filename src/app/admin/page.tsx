"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MuseumIcon from "@/components/MuseumIcon";

interface Stats {
  stations: number;
  kiosks: number;
  questions: number;
  attempts_today: number;
  chat_sessions: number;
}

const cards = [
  { key: "stations" as const, label: "Audio Stations", icon: "headphones", href: "/admin/stations" },
  { key: "kiosks" as const, label: "Kiosks", icon: "gallery", href: "/admin/kiosks" },
  { key: "questions" as const, label: "Quiz Questions", icon: "scroll", href: "/admin/quiz" },
  { key: "attempts_today" as const, label: "Attempts Today", icon: "award", href: "/admin/quiz" },
  { key: "chat_sessions" as const, label: "Chat Sessions", icon: "lotus", href: "/admin/knowledge" },
];

const quickActions = [
  { href: "/admin/stations", icon: "headphones", title: "Add Station", desc: "Create a new audio station" },
  { href: "/admin/kiosks", icon: "gallery", title: "Add Kiosk", desc: "Set up a new kiosk display" },
  { href: "/admin/knowledge", icon: "lotus", title: "Upload PDF", desc: "Add knowledge base document" },
  { href: "/admin/quiz", icon: "scroll", title: "Add Question", desc: "Create quiz questions" },
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
    <div className="w-full">
      <p className="m-eyebrow mb-1">Overview</p>
      <h1 className="text-3xl mb-6" style={{ color: "var(--ivory)" }}>Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.key} href={card.href} className="m-card m-card-interactive p-4 block">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{ background: "rgba(224, 123, 46, 0.12)", border: "1px solid var(--hairline)", color: "var(--saffron)" }}
            >
              <MuseumIcon name={card.icon} size={20} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--ivory)", fontFamily: "var(--font-body)" }}>
              {stats ? stats[card.key] : "—"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <p className="m-eyebrow mb-3">Quick Actions</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickActions.map((a) => (
          <Link key={a.title} href={a.href} className="m-card m-card-interactive flex items-center gap-3 p-4">
            <span
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(212, 163, 79, 0.1)", border: "1px solid var(--hairline)", color: "var(--gold)" }}
            >
              <MuseumIcon name={a.icon} size={20} />
            </span>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: "var(--ivory)" }}>{a.title}</p>
              <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{a.desc}</p>
            </div>
            <span style={{ color: "var(--ink-faint)" }}>
              <MuseumIcon name="arrowRight" size={16} />
            </span>
          </Link>
        ))}
      </div>

      {/* Service health */}
      <p className="m-eyebrow mt-8 mb-3">Services</p>
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
        <div key={s.name} className="m-card p-3 flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${health[s.name] === undefined ? "animate-pulse" : ""}`}
            style={{
              background:
                health[s.name] === undefined
                  ? "var(--ink-faint)"
                  : health[s.name]
                    ? "#7A9E7D"
                    : "#D9776B",
            }}
          />
          <span className="text-sm" style={{ color: "var(--ivory)" }}>{s.name}</span>
        </div>
      ))}
    </div>
  );
}
