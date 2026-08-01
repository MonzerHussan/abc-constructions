export const LOCALES = ["ar", "en", "ur"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isSupportedLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function getDir(locale: Locale): "rtl" | "ltr" {
  return locale === "en" ? "ltr" : "rtl";
}

export const LOCALE_LABELS: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  ur: "اردو",
};

export const LOCALE_FONTS: Record<Locale, string> = {
  ar: "font-ar",
  en: "font-en",
  ur: "font-ur",
};

export function setLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}
