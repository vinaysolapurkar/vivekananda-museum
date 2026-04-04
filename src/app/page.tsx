"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const modules = [
  {
    href: "/guide",
    title: "Audio Guide",
    description: "Guided audio tour through the gallery with narration in your language",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" />
      </svg>
    ),
  },
  {
    href: "/kiosk",
    title: "Exhibit Displays",
    description: "Interactive presentations on Swami Vivekananda's life and teachings",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    href: "/chat",
    title: "Ask Vivekananda",
    description: "Chat with AI-powered guide about the teachings and philosophy",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    href: "/quiz",
    title: "Knowledge Quiz",
    description: "Test your understanding and earn a certificate of completion",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    href: "/map",
    title: "World Travels",
    description: "Trace Vivekananda's journey across the globe from India to the West",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

const quotes = [
  "Arise, awake, and stop not till the goal is reached.",
  "You have to grow from the inside out. None can teach you, none can make you spiritual.",
  "In a conflict between the heart and the brain, follow your heart.",
  "All the powers in the universe are already ours. It is we who have put our hands before our eyes and cry that it is dark.",
  "The greatest sin is to think yourself weak.",
  "Take up one idea. Make that one idea your life.",
  "Strength is life, weakness is death.",
];

export default function Home() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteFade, setQuoteFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteFade(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % quotes.length);
        setQuoteFade(true);
      }, 400);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#0A0E27' }}>
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient mesh */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 20% 20%, rgba(212,163,79,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(212,163,79,0.03) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(17,22,56,0.8) 0%, transparent 100%)'
        }} />
        {/* Stars */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 23 + 7) % 100}%`,
              background: i % 5 === 0 ? '#D4A34F' : '#F5F0E8',
              opacity: 0.15 + (i % 4) * 0.1,
              animation: `starTwinkle ${3 + (i % 4)}s ease-in-out ${(i % 7) * 0.5}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <header className="relative px-6 pt-16 pb-12 text-center">
        <div className="relative max-w-2xl mx-auto">
          {/* Decorative line */}
          <div className="mx-auto w-16 h-px mb-8" style={{ background: 'linear-gradient(90deg, transparent, #D4A34F, transparent)' }} />

          {/* Om symbol */}
          <div
            className="text-4xl mb-6 animate-float"
            style={{ color: '#D4A34F', fontFamily: '"Cormorant Garamond", serif', fontWeight: 300 }}
          >
            \u0950
          </div>

          <h1
            className="text-5xl md:text-6xl font-light tracking-[0.2em] uppercase mb-4 animate-fade-in-up"
            style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5F0E8' }}
          >
            Vivekananda Smriti
          </h1>

          <p
            className="text-sm tracking-[0.3em] uppercase mb-2 animate-fade-in-up"
            style={{ color: '#D4A34F', animationDelay: '0.15s', fontFamily: '"DM Sans", sans-serif' }}
          >
            Ramakrishna Ashram, Mysore
          </p>
          <p
            className="text-sm animate-fade-in-up"
            style={{ color: '#8B8FA3', animationDelay: '0.3s' }}
          >
            Discover the life and teachings of Swami Vivekananda
          </p>

          {/* Decorative line */}
          <div className="mx-auto w-16 h-px mt-8" style={{ background: 'linear-gradient(90deg, transparent, #D4A34F, transparent)' }} />
        </div>
      </header>

      {/* Module Cards */}
      <main className="flex-1 px-5 pb-8 max-w-2xl mx-auto w-full relative z-10">
        <p
          className="text-[11px] tracking-[0.25em] uppercase mb-5 px-1 animate-fade-in-up"
          style={{ color: '#8B8FA3', animationDelay: '0.4s' }}
        >
          Choose Your Experience
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((m, idx) => (
            <Link
              key={m.href}
              href={m.href}
              className="group relative rounded-2xl p-5 flex flex-col transition-all duration-500 animate-fade-in-up"
              style={{
                animationDelay: `${0.45 + idx * 0.08}s`,
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,163,79,0.25)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110"
                  style={{ background: 'rgba(212,163,79,0.1)', color: '#D4A34F', border: '1px solid rgba(212,163,79,0.15)' }}
                >
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-lg font-semibold mb-1 transition-colors duration-300 group-hover:text-[#E8B84B]"
                    style={{ fontFamily: '"Cormorant Garamond", serif', color: '#F5F0E8' }}
                  >
                    {m.title}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: '#8B8FA3' }}>
                    {m.description}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div
                className="mt-4 flex items-center gap-1.5 text-xs font-medium transition-all duration-300 group-hover:gap-3"
                style={{ color: '#D4A34F' }}
              >
                <span>Enter</span>
                <span className="transition-all duration-300">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Floating Quote */}
      <div className="px-6 pb-6 relative z-10">
        <div
          className="max-w-2xl mx-auto text-center py-6 rounded-2xl"
          style={{
            background: 'rgba(212,163,79,0.04)',
            border: '1px solid rgba(212,163,79,0.08)',
          }}
        >
          <p
            className="italic text-base px-6 leading-relaxed transition-opacity duration-400"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              color: '#D4A34F',
              opacity: quoteFade ? 1 : 0,
            }}
          >
            &ldquo;{quotes[quoteIndex]}&rdquo;
          </p>
          <p className="text-xs mt-2" style={{ color: '#8B8FA3' }}>
            &mdash; Swami Vivekananda
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-5 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-xs" style={{ color: '#8B8FA3' }}>
          Vivekananda Smriti &middot; Ramakrishna Ashram, Mysore
        </p>
        <Link
          href="/admin"
          className="text-xs mt-1 inline-block transition-colors duration-300"
          style={{ color: 'rgba(139,143,163,0.5)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#D4A34F'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(139,143,163,0.5)'; }}
        >
          Admin Access
        </Link>
      </footer>
    </div>
  );
}
