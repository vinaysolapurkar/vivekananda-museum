"use client";

import Link from "next/link";
import MuseumIcon from "@/components/MuseumIcon";
import QuoteRotator from "@/components/QuoteRotator";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/components/LanguageProvider";
import type { StringKey } from "@/lib/i18n";

const modules: {
  href: string;
  titleKey: StringKey;
  subKey: StringKey;
  icon: string;
  accent: string;
  target?: string;
}[] = [
  { href: "/guide", titleKey: "mod.guide.title", subKey: "mod.guide.sub", icon: "headphones", accent: "#D4A34F" },
  { href: "/kiosk/slideshow", titleKey: "mod.gallery.title", subKey: "mod.gallery.sub", icon: "gallery", accent: "#C8963E" },
  { href: "/timeline", titleKey: "mod.timeline.title", subKey: "mod.timeline.sub", icon: "clock", accent: "#B9895C" },
  { href: "https://madhuraank-sv-ai.hf.space", titleKey: "mod.chat.title", subKey: "mod.chat.sub", icon: "lotus", accent: "#7A9E7D", target: "_blank" },
  { href: "/quiz", titleKey: "mod.quiz.title", subKey: "mod.quiz.sub", icon: "scroll", accent: "#E07B2E" },
  { href: "/letters", titleKey: "mod.letters.title", subKey: "mod.letters.sub", icon: "letter", accent: "#B98D4A" },
  { href: "/map", titleKey: "mod.map.title", subKey: "mod.map.sub", icon: "globe", accent: "#C8A882" },
  { href: "/centres", titleKey: "mod.centres.title", subKey: "mod.centres.sub", icon: "temple", accent: "#4A90D9" },
];

export default function Home() {
  const { t, lang } = useLang();
  // Indic scripts need their font and shouldn't get wide Latin letter-spacing.
  const fontFor = (): React.CSSProperties =>
    lang === "en" ? {} : { fontFamily: "var(--font-kannada)", letterSpacing: "0.02em" };

  return (
    <div className="min-h-screen flex flex-col page-enter" style={{ background: "var(--background)" }}>
      {/* Hero — full-bleed silhouette behind the text, same treatment as the AttractMode screensaver
          (radial vignette) so Swamiji's portrait reads clearly without fighting the text. */}
      <header className="relative overflow-hidden min-h-[45vh] flex items-center" style={{ background: "var(--bg-hero)" }}>
        <img
          src="/images/home-hero-silhouette.jpg"
          alt="Swami Vivekananda"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: "center 20%", opacity: 0.72 }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 85% 85% at 50% 35%, transparent 35%, rgba(20,16,13,0.35) 75%, var(--background) 100%)",
          }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--diya-glow)" }} />

        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{ height: "45%", background: "linear-gradient(to top, var(--background) 0%, transparent 100%)" }}
        />

        {/* Language switcher — left corner, framed so it reads over the photo */}
        <div
          className="absolute top-4 left-4 md:top-6 md:left-6 z-20 inline-flex rounded-full p-1"
          style={{ background: "rgba(13,10,8,0.55)", backdropFilter: "blur(8px)" }}
        >
          <LanguageSwitcher size="sm" />
        </div>

        <div className="relative px-6 md:px-14 py-12 md:py-16 max-w-3xl mx-auto flex flex-col items-center text-center">
          <img
            src="/images/logo.png"
            alt="Ramakrishna Math"
            className="w-20 h-20 md:w-24 md:h-24 object-contain mb-4 animate-fade-in-up"
            style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
          />

          <p
            className="text-sm md:text-base font-medium animate-fade-in-up"
            style={{ color: "#EFE6D8", textShadow: "0 1px 12px rgba(0,0,0,0.55)", ...fontFor() }}
          >
            {t("home.instituteName")}
          </p>
          <p
            className="m-eyebrow mt-1.5 animate-fade-in-up"
            style={{ color: "#D9CBB8", textShadow: "0 1px 10px rgba(0,0,0,0.55)", ...fontFor() }}
          >
            {t("app.ashram")}
          </p>

          <h1
            className="mt-6 animate-fade-in-up"
            style={{
              fontFamily: lang === "en" ? "Cormorant Garamond, serif" : "var(--font-kannada)",
              fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)",
              color: "var(--ivory)",
              fontWeight: 300,
              letterSpacing: "0.02em",
              lineHeight: 1.15,
              textShadow: "0 2px 24px rgba(0,0,0,0.45)",
            }}
          >
            {t("home.heroTitle")}
          </h1>
          <p
            className="mt-3 animate-fade-in-up"
            style={{
              fontFamily: lang === "en" ? "Cormorant Garamond, serif" : "var(--font-kannada)",
              fontSize: "clamp(1rem, 1.6vw, 1.5rem)",
              color: "#EFE6D8",
              fontWeight: 400,
              lineHeight: 1.35,
              whiteSpace: "nowrap",
              textShadow: "0 2px 16px rgba(0,0,0,0.6)",
            }}
          >
            {t("home.heroTagline")}
          </p>
        </div>
      </header>

      {/* Modules */}
      <main className="flex-1 px-6 md:px-14 py-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <p className="m-eyebrow" style={fontFor()}>{t("common.beginJourney")}</p>
          <div className="flex-1 h-px" style={{ background: "var(--hairline)" }} />
        </div>

        {lang === "en" ? (
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
                  className="rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
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
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      color: "var(--ivory)",
                      fontWeight: 600,
                    }}
                  >
                    {t(m.titleKey)}
                  </h2>
                  <p className="text-[0.82rem] leading-snug mt-0.5" style={{ color: "var(--ink-muted)", ...fontFor() }}>
                    {t(m.subKey)}
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
        ) : (
          <div
            className="m-card flex flex-col items-center text-center py-16 px-8 animate-fade-in-up"
            style={{ borderColor: "var(--hairline)" }}
          >
            <MuseumIcon name="clock" size={40} strokeWidth={1.3} style={{ color: "var(--ink-faint)", marginBottom: 18 }} />
            <h2
              className="text-2xl md:text-3xl mb-2"
              style={{ fontFamily: "var(--font-kannada)", color: "var(--ivory)", fontWeight: 600 }}
            >
              {t("common.comingSoon")}
            </h2>
            <p className="text-sm max-w-md" style={{ color: "var(--ink-muted)", ...fontFor() }}>
              {t("common.comingSoonSub")}
            </p>
          </div>
        )}
      </main>

      {/* Footer — quote of the day, centred */}
      <footer className="px-6 py-8 text-center">
        <div className="m-divider mb-5"><span>✦</span></div>
        <div className="max-w-xl mx-auto">
          <QuoteRotator />
          <p className="text-xs mt-1 font-medium" style={{ color: "var(--gold)" }}>
            — Swami Vivekananda
          </p>
        </div>
        <Link
          href="/admin"
          className="text-xs hover:underline mt-6 inline-block"
          style={{ color: "rgba(212,163,79,0.35)" }}
        >
          Admin
        </Link>
      </footer>
    </div>
  );
}
