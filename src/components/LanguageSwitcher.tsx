"use client";

import { LANGS } from "@/lib/i18n";
import { useLang } from "@/components/LanguageProvider";

/**
 * Compact language switcher — three pills (EN / ಕ / हि).
 * Drop into any page header. Reads and writes the shared language context.
 */
export default function LanguageSwitcher({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const { lang, setLang } = useLang();
  const pad = size === "sm" ? "min-h-[36px] px-3 text-xs" : "min-h-[42px] px-4 text-sm";

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          aria-label={l.label}
          className={`m-chip ${pad} ${lang === l.code ? "m-chip-active" : ""}`}
          style={{ fontFamily: l.code === "en" ? "inherit" : "var(--font-kannada)" }}
        >
          {size === "sm" ? l.short : l.label}
        </button>
      ))}
    </div>
  );
}
