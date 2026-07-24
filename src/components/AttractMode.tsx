"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";

// Multilingual quotes cycled on the idle screen.
const QUOTES: { en: string; kn: string; hi: string }[] = [
  {
    en: "Arise, awake, and stop not till the goal is reached.",
    kn: "ಏಳಿ, ಎಚ್ಚರಗೊಳ್ಳಿ, ಗುರಿ ತಲುಪುವವರೆಗೂ ನಿಲ್ಲಬೇಡಿ.",
    hi: "उठो, जागो और तब तक मत रुको जब तक लक्ष्य प्राप्त न हो जाए।",
  },
  {
    en: "All power is within you; you can do anything and everything.",
    kn: "ಎಲ್ಲಾ ಶಕ್ತಿಯೂ ನಿಮ್ಮೊಳಗಿದೆ; ನೀವು ಏನನ್ನಾದರೂ ಮಾಡಬಲ್ಲಿರಿ.",
    hi: "सारी शक्ति तुम्हारे भीतर है; तुम कुछ भी कर सकते हो।",
  },
  {
    en: "They alone live who live for others.",
    kn: "ಇತರರಿಗಾಗಿ ಬದುಕುವವರೇ ನಿಜವಾಗಿ ಬದುಕುತ್ತಾರೆ.",
    hi: "वही जीते हैं जो दूसरों के लिए जीते हैं।",
  },
  {
    en: "Take up one idea. Make that one idea your life.",
    kn: "ಒಂದು ಆದರ್ಶವನ್ನು ಹಿಡಿಯಿರಿ. ಅದನ್ನೇ ನಿಮ್ಮ ಜೀವನವಾಗಿಸಿ.",
    hi: "एक विचार लो। उस एक विचार को अपना जीवन बना लो।",
  },
];

const IDLE_MS = 60_000; // show screensaver after 1 minute of no interaction
const SLIDE_MS = 7_000; // advance image + quote every 7s

export default function AttractMode() {
  const { lang } = useLang();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [images, setImages] = useState<string[]>(["/images/vivekananda-portrait.jpg"]);
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Never run the screensaver inside the admin area or on the map iframes.
  const enabled = !pathname.startsWith("/admin");

  // (Re)start the idle countdown. Stable identity — does NOT read `active`, so
  // turning the screensaver ON never re-runs the idle effect (which would
  // otherwise immediately dismiss it).
  const scheduleIdle = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(true), IDLE_MS);
  }, []);

  // Any real interaction dismisses the screensaver and restarts the countdown.
  const onActivity = useCallback(() => {
    setActive(false);
    scheduleIdle();
  }, [scheduleIdle]);

  // Fetch a handful of gallery covers for visual variety (best-effort).
  useEffect(() => {
    let alive = true;
    fetch("/api/slideshow/categories")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const covers = (d.categories || [])
          .map((c: { cover?: string | null }) => c.cover)
          .filter((u: unknown): u is string => typeof u === "string" && u.length > 0)
          .slice(0, 6);
        if (covers.length) setImages(["/images/vivekananda-portrait.jpg", ...covers]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Idle detection. Runs once per `enabled` change (onActivity/scheduleIdle are
  // stable), so the screensaver stays up once triggered until a real interaction.
  useEffect(() => {
    if (!enabled) {
      if (timer.current) clearTimeout(timer.current);
      setActive(false);
      return;
    }
    const events = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    scheduleIdle();
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [enabled, onActivity, scheduleIdle]);

  // Advance slides while active
  useEffect(() => {
    if (!active) return;
    setIdx(0);
    const iv = setInterval(() => setIdx((i) => i + 1), SLIDE_MS);
    return () => clearInterval(iv);
  }, [active]);

  if (!active) return null;

  const img = images[idx % images.length];
  const quote = QUOTES[idx % QUOTES.length];

  return (
    <div
      onClick={onActivity}
      className="fixed inset-0 z-[9999] overflow-hidden cursor-pointer"
      style={{ background: "var(--background)", animation: "attractFade 1s ease" }}
      role="button"
      aria-label="Screensaver — touch to begin"
    >
      {/* Ken Burns image, cross-faded by key */}
      <div key={img} className="absolute inset-0" style={{ animation: "attractKen 8s ease-out both" }}>
        <img src={img} alt="" className="w-full h-full object-cover" style={{ opacity: 0.5 }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% 40%, transparent 20%, rgba(20,16,13,0.6) 70%, var(--background) 100%)",
          }}
        />
      </div>

      {/* Warm vignette + diya glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--diya-glow)" }} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8">
        <img
          src="/images/logo.png"
          alt=""
          className="w-20 h-20 object-contain mb-8"
          style={{ filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.5))" }}
        />
        <h1
          className="text-5xl md:text-7xl mb-3"
          style={{ fontFamily: "Cormorant Garamond, serif", color: "var(--ivory)", fontWeight: 300, letterSpacing: "0.02em" }}
        >
          Viveka Smaraka
        </h1>
        <div className="m-divider mb-8" style={{ width: 200 }}>
          <span>✦</span>
        </div>
        <p
          key={idx}
          className="text-2xl md:text-3xl italic max-w-3xl leading-relaxed"
          style={{ color: "#E8D6BE", animation: "attractFade 1.2s ease", fontFamily: lang === "en" ? "Cormorant Garamond, serif" : "var(--font-kannada)" }}
        >
          &ldquo;{quote[lang]}&rdquo;
        </p>
        <p className="text-sm mt-3" style={{ color: "var(--gold)" }}>
          — Swami Vivekananda
        </p>

        {/* Touch prompt */}
        <div
          className="absolute bottom-16 flex items-center gap-3"
          style={{ animation: "attractPulse 2.4s ease-in-out infinite" }}
        >
          <span
            className="inline-block w-9 h-9 rounded-full border-2"
            style={{ borderColor: "var(--gold)", animation: "attractRipple 2.4s ease-out infinite" }}
          />
          <span
            className="text-base tracking-wide uppercase"
            style={{ color: "var(--ivory)", fontFamily: lang === "en" ? "inherit" : "var(--font-kannada)" }}
          >
            {lang === "kn" ? "ಆರಂಭಿಸಲು ಸ್ಪರ್ಶಿಸಿ" : lang === "hi" ? "शुरू करने के लिए स्पर्श करें" : "Touch anywhere to begin"}
          </span>
        </div>
      </div>
    </div>
  );
}
