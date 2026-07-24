"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { type Lang, type StringKey, translate } from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "museum-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Restore saved language once mounted (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved === "en" || saved === "kn" || saved === "hi") setLangState(saved);
    } catch {
      /* localStorage unavailable — stay on default */
    }
  }, []);

  // Keep the <html lang> attribute in sync so CSS (e.g. Indic letter-spacing
  // overrides) and screen readers see the active language.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: StringKey) => translate(key, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback so components used outside the provider still render in English.
    return { lang: "en", setLang: () => {}, t: (key) => translate(key, "en") };
  }
  return ctx;
}
