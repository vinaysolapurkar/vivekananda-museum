import Link from "next/link";

const modules = [
  {
    href: "/guide",
    title: "Audio Guide",
    description: "Guided audio tour through the gallery with narration in your language",
    icon: "🎧",
    color: "bg-primary",
    accent: "#1A237E",
  },
  {
    href: "/kiosk",
    title: "Exhibit Displays",
    description: "Interactive presentations on Swami Vivekananda's life and teachings",
    icon: "🖥️",
    color: "bg-saffron",
    accent: "#FF8F00",
  },
  {
    href: "/chat",
    title: "Ask Vivekananda",
    description: "Chat with AI-powered guide about the teachings and philosophy",
    icon: "💬",
    color: "bg-accent",
    accent: "#4CAF50",
  },
  {
    href: "/quiz",
    title: "Knowledge Quiz",
    description: "Test your understanding and earn a certificate of completion",
    icon: "📝",
    color: "bg-primary-light",
    accent: "#3949AB",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAFAF7' }}>
      {/* Hero Section */}
      <header 
        className="relative overflow-hidden px-6 py-14 text-white text-center"
        style={{ 
          background: 'linear-gradient(160deg, #1A237E 0%, #283593 50%, #1A237E 100%)',
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M40 0C17.9 0 0 17.9 0 40s17.9 40 40 40 40-17.9 40-40S62.1 0 40 0zm40 68c0 2.2-1.8 4-4 4H4c-2.2 0-4-1.8-4-4V12c0-2.2 1.8-4 4-4h72c2.2 0 4 1.8 4 4v56z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-px bg-white/20" />
        
        <div className="relative max-w-2xl mx-auto">
          {/* Om Symbol */}
          <div className="text-5xl mb-4 opacity-80">🙏</div>
          
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
            style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}
          >
            Vivekananda Smriti
          </h1>
          
          <p 
            className="text-white/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Ramakrishna Ashram, Mysore
          </p>
          <p className="text-white/60 text-sm">
            Discover the life and teachings of Swami Vivekananda
          </p>
        </div>
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-24 h-px bg-white/20" />
      </header>

      {/* Quote Banner */}
      <div 
        className="mx-4 md:mx-auto max-w-2xl -mt-4 relative z-10"
      >
        <div 
          className="rounded-2xl p-5 text-center border border-saffron/20"
          style={{ background: 'linear-gradient(135deg, #FFF8E1 0%, #FFFDE7 100%)' }}
        >
          <p 
            className="italic text-gray-800 text-base leading-relaxed"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            "Arise, awake, and stop not till the goal is reached."
          </p>
          <p className="text-amber-700 text-xs mt-2 font-medium">— Swami Vivekananda</p>
        </div>
      </div>

      {/* Module Cards */}
      <main className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4 px-2">
          Choose Your Experience
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((m, idx) => (
            <Link
              key={m.href}
              href={m.href}
              className="group relative bg-white rounded-2xl border border-gray-100 p-5 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                animationDelay: `${idx * 80}ms`,
                borderLeft: `3px solid ${m.accent}`,
              }}
            >
              {/* Glow on hover */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                style={{ 
                  boxShadow: `0 8px 32px ${m.accent}20`,
                }}
              />
              
              <div className="flex items-start gap-4">
                <div 
                  className={`w-14 h-14 ${m.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 
                    className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-900 transition-colors"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {m.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed">{m.description}</p>
                </div>
              </div>
              
              {/* Arrow indicator */}
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold transition-colors group-hover:gap-2" style={{ color: m.accent }}>
                <span>Start</span>
                <span className="transition-all">→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Vivekananda Smriti • Ramakrishna Ashram, Mysore
        </p>
        <Link 
          href="/admin" 
          className="text-xs text-gray-400 hover:text-saffron transition-colors mt-1 inline-block"
        >
          Admin Access
        </Link>
      </footer>
    </div>
  );
}
