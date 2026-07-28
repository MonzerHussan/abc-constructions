"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { translations, TranslationKey } from "@/lib/translations";

type Language = "ar" | "en" | "ur";

const langLabels: Record<Language, string> = {
  ar: "عربي",
  en: "EN",
  ur: "اردو",
};

interface LanguageContextType {
  language: Language;
  dir: "rtl" | "ltr";
  t: (key: TranslationKey) => string;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  langLabel: string;
  nextLangLabel: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");

  const dir = language === "en" ? "ltr" : "rtl";

  const t = useCallback(
    (key: TranslationKey): string => {
      const lang = translations[language] as Record<string, string>;
      return lang[key] || key;
    },
    [language]
  );

  const cycleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next: Language = prev === "ar" ? "en" : prev === "en" ? "ur" : "ar";
      if (typeof document !== "undefined") {
        document.documentElement.dir = next === "en" ? "ltr" : "rtl";
        document.documentElement.lang = next;
      }
      return next;
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof document !== "undefined") {
      document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
      document.documentElement.lang = lang;
    }
  }, []);

  const langLabel = langLabels[language];
  const nextLangLabel = langLabels[language === "ar" ? "en" : language === "en" ? "ur" : "ar"];

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
