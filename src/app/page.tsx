import Link from "next/link";

const modules = [
  {
    href: "/guide",
    title: "Audio Guide",
    subtitle: "Guided narration through the gallery",
    symbol: "🎧",
    accent: "#E07B2E",
  },
  {
    href: "/kiosk/slideshow",
    title: "Exhibit Gallery",
    subtitle: "Visual journey through Swamiji's life",
    symbol: "🖼",
    accent: "#7B2D26",
  },
  {
    href: "/chat",
    title: "Speak with Swamiji",
    subtitle: "AI-guided wisdom from his teachings",
    symbol: "🙏",
    accent: "#5B7B5E",
  },
  {
    href: "/quiz",
    title: "Knowledge Quiz",
    subtitle: "Test your understanding, earn a certificate",
    symbol: "📜",
    accent: "#C8963E",
  },
  {
    href: "/map",
    title: "World Travels",
    subtitle: "Trace his journey from India to the West",
    symbol: "🌏",
    accent: "#8B4513",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFF8F0' }}>
      {/* Hero */}
      <header className="relative overflow-hidden text-center px-6 py-16" style={{ 
        background: 'linear-gradient(170deg, #7B2D26 0%, #9B3D34 40%, #7B2D26 100%)' 
      }}>
        {/* Decorative pattern — temple motif */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20z' fill='%23FFFFFF' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px',
        }} />
        
        <div className="relative max-w-2xl mx-auto">
          {/* Om */}
          <div className="text-4xl mb-3 opacity-60" style={{ color: '#DDAA4F' }}>ॐ</div>
          
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-12 h-px" style={{ background: 'rgba(221,170,79,0.4)' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#DDAA4F' }} />
            <div className="w-12 h-px" style={{ background: 'rgba(221,170,79,0.4)' }} />
          </div>

          <p className="text-sm tracking-[0.3em] uppercase mb-3" style={{ 
            color: 'rgba(255,248,240,0.6)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.3em' 
          }}>
            Ramakrishna Ashram &middot; Mysore
          </p>

          <h1 className="text-5xl md:text-6xl font-light mb-4" style={{ 
            fontFamily: 'Cormorant Garamond, serif', color: '#FFF8F0', fontWeight: 300, letterSpacing: '0.02em'
          }}>
            Vivekananda Smriti
          </h1>
          
          <p className="text-base max-w-md mx-auto leading-relaxed" style={{ 
            color: 'rgba(255,248,240,0.7)', fontFamily: 'DM Sans, sans-serif' 
          }}>
            Experience the life and teachings of<br />Swami Vivekananda
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-16 h-px" style={{ background: 'rgba(221,170,79,0.3)' }} />
            <div className="text-xs" style={{ color: '#DDAA4F' }}>✦</div>
            <div className="w-16 h-px" style={{ background: 'rgba(221,170,79,0.3)' }} />
          </div>
        </div>
      </header>

      {/* Quote */}
      <div className="mx-4 md:mx-auto max-w-2xl -mt-5 relative z-10">
        <div className="rounded-2xl px-6 py-5 text-center" style={{ 
          background: 'white', 
          border: '1px solid #E8D8C8',
          boxShadow: '0 4px 20px rgba(139,69,19,0.08)'
        }}>
          <p className="italic text-lg leading-relaxed" style={{ 
            fontFamily: 'Cormorant Garamond, serif', color: '#4A3728', fontWeight: 500
          }}>
            "Arise, awake, and stop not till the goal is reached."
          </p>
          <p className="text-xs mt-2 font-medium" style={{ color: '#E07B2E' }}>
            — Swami Vivekananda
          </p>
        </div>
      </div>

      {/* Modules */}
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <p className="text-xs tracking-[0.2em] uppercase font-medium mb-5 px-1" style={{ color: '#8B7B6B' }}>
          Begin Your Journey
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((m, i) => (
            <Link
              key={m.href}
              href={m.href}
              className="group card-spiritual p-5 flex flex-col animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms`, borderLeft: `3px solid ${m.accent}` }}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${m.accent}15`, color: m.accent }}
                >
                  {m.symbol}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold mb-0.5 group-hover:text-maroon transition-colors" style={{ 
                    fontFamily: 'Cormorant Garamond, serif', color: '#2C1810', fontWeight: 600
                  }}>
                    {m.title}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: '#8B7B6B' }}>
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
      <footer className="px-6 py-6 text-center" style={{ borderTop: '1px solid #E8D8C8' }}>
        <p className="text-xs" style={{ color: '#8B7B6B' }}>
          Sri Ramakrishna Ashram &middot; Mysore
        </p>
        <Link href="/admin" className="text-xs hover:underline mt-1 inline-block" style={{ color: '#C8963E' }}>
          Admin
        </Link>
      </footer>
    </div>
  );
}
