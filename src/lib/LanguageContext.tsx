"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { translations, AnyTranslationKey } from "@/lib/translations";
import {
  DEFAULT_LOCALE,
  getDir,
  isSupportedLocale,
  Locale,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  setLocaleCookie,
} from "@/lib/i18n";

interface LanguageContextType {
  language: Locale;
  dir: "rtl" | "ltr";
  t: (key: AnyTranslationKey) => string;
  toggleLanguage: () => void;
  setLanguage: (lang: Locale) => void;
  langLabel: string;
  nextLangLabel: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: string;
}) {
  const [language, setLanguageState] = useState<Locale>(() =>
    isSupportedLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE
  );

  const dir = getDir(language);

  const t = useCallback(
    (key: AnyTranslationKey): string => {
      const lang = translations[language] as Record<string, string>;
      return (lang as Record<string, string>)[key] || key;
    },
    [language]
  );

  const cycleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next: Locale = prev === "ar" ? "en" : prev === "en" ? "ur" : "ar";
      setLocaleCookie(next);
      if (typeof document !== "undefined") {
        document.documentElement.dir = getDir(next);
        document.documentElement.lang = next;
      }
      return next;
    });
  }, []);

  const setLanguage = useCallback((lang: Locale) => {
    setLanguageState(lang);
    setLocaleCookie(lang);
    if (typeof document !== "undefined") {
      document.documentElement.dir = getDir(lang);
      document.documentElement.lang = lang;
    }
  }, []);

  const langLabel = LOCALE_LABELS[language];
  const nextLangLabel = LOCALE_LABELS[language === "ar" ? "en" : language === "en" ? "ur" : "ar"];

  return (
    <LanguageContext.Provider value={{ language, dir, t, toggleLanguage: cycleLanguage, setLanguage, langLabel, nextLangLabel }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export type { Locale };
export { LOCALE_COOKIE };
