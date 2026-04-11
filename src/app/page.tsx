import Link from "next/link";

const modules: { href: string; title: string; subtitle: string; symbol: string; accent: string; target?: string }[] = [
  {
    href: "/guide",
    title: "Audio Guide",
    subtitle: "Guided narration through the gallery",
    symbol: "🎧",
    accent: "#D4A34F",
  },
  {
    href: "/kiosk/slideshow",
    title: "Exhibit Gallery",
    subtitle: "Visual journey through Swamiji's life",
    symbol: "🖼",
    accent: "#C8963E",
  },
  {
    href: "https://madhuraank-sv-ai.hf.space",
    title: "Speak with Swamiji",
    subtitle: "AI-guided wisdom from his teachings",
    symbol: "🙏",
    accent: "#7A9E7D",
    target: "_blank",
  },
  {
    href: "/quiz",
    title: "Knowledge Quiz",
    subtitle: "Test your understanding, earn a certificate",
    symbol: "📜",
    accent: "#E07B2E",
  },
  {
    href: "/map",
    title: "World Travels",
    subtitle: "Interactive Cesium globe · 5 phases · timeline & country filters",
    symbol: "🌏",
    accent: "#C8A882",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(170deg, #1a0f0a 0%, #2a1810 30%, #1c1008 100%)',
    }}>
      {/* Hero */}
      <header className="relative overflow-hidden text-center px-6 py-16" style={{
        background: 'linear-gradient(170deg, #3a1a12 0%, #2a1810 50%, #1a0f0a 100%)',
      }}>
        {/* Decorative pattern — temple motif */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20z' fill='%23D4A34F' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px',
        }} />
        {/* Vivekananda portrait — right side presence */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{
          backgroundImage: 'url(/images/vivekananda-portrait.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
          backgroundSize: 'auto 120%',
          maskImage: 'linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
          filter: 'sepia(0.4) brightness(1.3)',
        }} />

        <div className="relative w-full px-6">
          {/* Logo */}
          <div className="mb-4">
            <img src="/images/logo.png" alt="Ramakrishna Math" className="w-24 h-24 mx-auto object-contain" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
          </div>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-12 h-px" style={{ background: 'rgba(212,163,79,0.3)' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(212,163,79,0.4)' }} />
            <div className="w-12 h-px" style={{ background: 'rgba(212,163,79,0.3)' }} />
          </div>

          <p className="text-sm tracking-[0.3em] uppercase mb-3" style={{
            color: '#9B8A72', fontFamily: 'DM Sans, sans-serif',
          }}>
            Ramakrishna Ashram &middot; Mysore
          </p>

          <h1 className="text-5xl md:text-6xl font-light mb-4" style={{
            fontFamily: 'Cormorant Garamond, serif', color: '#F5EDE0', fontWeight: 300, letterSpacing: '0.02em',
            textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          }}>
            Viveka Smaraka
          </h1>

          <p className="text-base leading-relaxed" style={{
            color: '#C8A882', fontFamily: 'DM Sans, sans-serif',
          }}>
            Experience the life and teachings of<br />Swami Vivekananda
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-16 h-px" style={{ background: 'rgba(212,163,79,0.2)' }} />
            <div className="text-xs" style={{ color: 'rgba(212,163,79,0.4)' }}>✦</div>
            <div className="w-16 h-px" style={{ background: 'rgba(212,163,79,0.2)' }} />
          </div>
        </div>
      </header>

      {/* Quote */}
      <div className="mx-4 -mt-5 relative z-10">
        <div className="rounded-2xl px-6 py-5 text-center" style={{
          background: 'rgba(255,245,230,0.04)',
          border: '1px solid rgba(212,163,79,0.15)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
        }}>
          <p className="italic text-lg leading-relaxed" style={{
            fontFamily: 'Cormorant Garamond, serif', color: '#D9CBBA', fontWeight: 500,
          }}>
            &ldquo;Arise, awake, and stop not till the goal is reached.&rdquo;
          </p>
          <p className="text-xs mt-2 font-medium" style={{ color: '#D4A34F' }}>
            — Swami Vivekananda
          </p>
        </div>
      </div>

      {/* Modules */}
      <main className="flex-1 px-4 py-8 w-full relative">
        {/* Subtle background portrait */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: 'url(/images/vivekananda-portrait.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center 20%',
          backgroundSize: 'auto 80%',
          filter: 'sepia(0.5) brightness(1.2)',
        }} />

        <p className="relative z-10 text-xs tracking-[0.2em] uppercase font-medium mb-5 px-1" style={{ color: '#9B8A72' }}>
          Begin Your Journey
        </p>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((m, i) => (
            <Link
              key={m.href}
              href={m.href}
              {...(m.target ? { target: m.target, rel: "noopener noreferrer" } : {})}
              className="group rounded-2xl p-5 flex flex-col animate-fade-in-up transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                animationDelay: `${i * 80}ms`,
                background: 'rgba(255,245,230,0.04)',
                border: '1px solid rgba(212,163,79,0.1)',
                borderLeft: `3px solid ${m.accent}`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'rgba(212,163,79,0.08)', color: m.accent }}
                >
                  {m.symbol}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold mb-0.5 transition-colors" style={{
                    fontFamily: 'Cormorant Garamond, serif', color: '#F5EDE0', fontWeight: 600,
                  }}>
                    {m.title}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: '#9B8A72' }}>
                    {m.subtitle}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium transition-all group-hover:gap-2" style={{ color: m.accent }}>
                <span>Enter</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center relative z-10">
        <div className="h-px mb-4" style={{
          background: 'linear-gradient(to right, transparent, rgba(212,163,79,0.12) 20%, rgba(212,163,79,0.12) 80%, transparent)',
        }} />
        <p className="text-xs" style={{ color: '#9B8A72' }}>
          Sri Ramakrishna Ashram &middot; Mysore
        </p>
        <Link href="/admin" className="text-xs hover:underline mt-1 inline-block" style={{ color: 'rgba(212,163,79,0.4)' }}>
          Admin
        </Link>
      </footer>
    </div>
  );
}
