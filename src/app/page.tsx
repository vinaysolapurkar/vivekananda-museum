import Link from "next/link";
import MuseumIcon from "@/components/MuseumIcon";
import QuoteRotator from "@/components/QuoteRotator";

const modules: { href: string; title: string; subtitle: string; icon: string; accent: string; target?: string }[] = [
  {
    href: "/guide",
    title: "Audio Guide",
    subtitle: "Guided narration through the gallery",
    icon: "headphones",
    accent: "#D4A34F",
  },
  {
    href: "/kiosk/slideshow",
    title: "Exhibit Gallery",
    subtitle: "Visual journey through Swamiji's life",
    icon: "gallery",
    accent: "#C8963E",
  },
  {
    href: "https://madhuraank-sv-ai.hf.space",
    title: "Speak with Swamiji",
    subtitle: "AI-guided wisdom from his teachings",
    icon: "lotus",
    accent: "#7A9E7D",
    target: "_blank",
  },
  {
    href: "/quiz",
    title: "Knowledge Quiz",
    subtitle: "Test your understanding, earn a certificate",
    icon: "scroll",
    accent: "#E07B2E",
  },
  {
    href: "/map",
    title: "World Travels",
    subtitle: "433 places across five continents, 1863–1902",
    icon: "globe",
    accent: "#C8A882",
  },
  {
    href: "/centres",
    title: "RKM Centres",
    subtitle: "323 centres of Ramakrishna Math & Mission worldwide",
    icon: "temple",
    accent: "#4A90D9",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Hero */}
      <header
        className="relative overflow-hidden"
        style={{ background: "var(--bg-hero)" }}
      >
        {/* Diya glow — signature warm lamp light */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--diya-glow)" }} />

        {/* Portrait — intentional duotone panel on the right */}
        <div
          className="absolute top-0 right-0 bottom-0 hidden md:block pointer-events-none"
          style={{
            width: "38%",
            backgroundImage: "url(/images/vivekananda-portrait.jpg)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center top",
            backgroundSize: "cover",
            filter: "sepia(0.55) contrast(0.95) brightness(0.85)",
            opacity: 0.5,
            maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.85) 35%, black 60%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.85) 35%, black 60%)",
          }}
        />
        {/* Bottom fade so the portrait melts into the page */}
        <div
          className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
        />

        <div className="relative px-6 md:px-14 pt-10 pb-12 md:pt-12 md:pb-14 max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <img
              src="/images/logo.png"
              alt="Ramakrishna Math"
              className="w-16 h-16 object-contain"
              style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
            />
            <p className="m-eyebrow" style={{ color: "#9B8A72" }}>
              Ramakrishna Ashram · Mysore
            </p>
          </div>

          <h1
            className="text-5xl md:text-6xl mb-4 animate-fade-in-up"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              color: "var(--ivory)",
              fontWeight: 300,
              letterSpacing: "0.015em",
              lineHeight: 1.05,
              textShadow: "0 2px 24px rgba(0,0,0,0.45)",
            }}
          >
            Viveka Smaraka
          </h1>

          <p
            className="text-lg mb-6 animate-fade-in-up"
            style={{ color: "#C8A882", animationDelay: "120ms", maxWidth: "28rem" }}
          >
            Experience the life and teachings of Swami Vivekananda
          </p>

          <div className="animate-fade-in-up" style={{ animationDelay: "240ms", maxWidth: "34rem" }}>
            <QuoteRotator />
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--gold)" }}>
              — Swami Vivekananda
            </p>
          </div>
        </div>
      </header>

      {/* Modules */}
      <main className="flex-1 px-6 md:px-14 py-10 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <p className="m-eyebrow">Begin your journey</p>
          <div className="flex-1 h-px" style={{ background: "var(--hairline)" }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {modules.map((m, i) => (
            <Link
              key={m.href}
              href={m.href}
              {...(m.target ? { target: m.target, rel: "noopener noreferrer" } : {})}
              className="m-card m-card-interactive group p-5 flex items-center gap-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div
                className="w-13 h-13 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  width: 54,
                  height: 54,
                  background: `linear-gradient(145deg, ${m.accent}26, ${m.accent}0D)`,
                  border: `1px solid ${m.accent}33`,
                  color: m.accent,
                }}
              >
                <MuseumIcon name={m.icon} size={25} />
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className="text-xl md:text-2xl leading-tight"
                  style={{ fontFamily: "Cormorant Garamond, serif", color: "var(--ivory)", fontWeight: 600 }}
                >
                  {m.title}
                </h2>
                <p className="text-[0.82rem] leading-snug mt-0.5" style={{ color: "var(--ink-muted)" }}>
                  {m.subtitle}
                </p>
              </div>
              <div
                className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: m.accent }}
              >
                <MuseumIcon name="arrowRight" size={18} strokeWidth={2} />
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-7 text-center">
        <div className="m-divider mb-4">
          <span>✦</span>
        </div>
        <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
          Sri Ramakrishna Ashram · Mysore
        </p>
        <Link
          href="/admin"
          className="text-xs hover:underline mt-1 inline-block"
          style={{ color: "rgba(212,163,79,0.35)" }}
        >
          Admin
        </Link>
      </footer>
    </div>
  );
}
