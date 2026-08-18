"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Globe, ChevronDown } from "lucide-react";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import { useLanguage } from "@/lib/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-none transition-colors border border-surface-200"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
      >
        <Globe className="w-4 h-4" />
        <span>{LOCALE_LABELS[language]}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute end-0 mt-2 w-44 bg-white rounded-none shadow-lg border border-surface-100 py-1 z-50"
        >
          {LOCALES.map((locale) => (
            <li key={locale} role="option" aria-selected={locale === language}>
              <button
                onClick={() => {
                  setLanguage(locale);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
              >
                <span className="flex-1 text-start">{LOCALE_LABELS[locale]}</span>
                {locale === language && <Check className="w-4 h-4 text-amber-600" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
