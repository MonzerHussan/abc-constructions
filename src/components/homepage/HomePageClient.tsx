"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AuthModal from "@/components/homepage/AuthModal";
import type { HomepageData, Zone, Slide } from "@/lib/homepage";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

function pick<T extends Record<string, unknown>>(o: T, lang: string): string {
  const v = o?.[lang] ?? o?.ar ?? "";
  return String(v ?? "");
}

function ZoneContent({ zone, lang }: { zone: Zone; lang: string }) {
  const title = pick(zone.title, lang);
  const body = pick(zone.body, lang);

  if (zone.contentType === "IMAGE" && zone.mediaUrl) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        {title && <p className="text-sm font-bold text-accent-400 mb-2 text-center">{title}</p>}
        <div className="relative w-full h-full min-h-0 flex-1">
          <Image src={zone.mediaUrl} alt={title} fill className="object-cover" sizes="260px" />
        </div>
      </div>
    );
  }
  if (zone.contentType === "VIDEO" && zone.mediaUrl) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        {title && <p className="text-sm font-bold text-accent-400 mb-2 text-center">{title}</p>}
        <video
          src={zone.mediaUrl}
          controls
          className="w-full rounded-none object-cover flex-1 min-h-0"
          poster=""
        />
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 text-center">
      {title && <p className="text-base font-bold text-accent-400 mb-2">{title}</p>}
      {body && <p className="text-sm leading-relaxed text-primary-100">{body}</p>}
      {zone.link && (
        <Link
          href={zone.link}
          className="mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-none bg-secondary-500 text-white text-xs font-bold hover:bg-secondary-600 transition-colors"
        >
          {title}
        </Link>
      )}
    </div>
  );
}

export default function HomePageClient({ data, authParam }: { data: HomepageData; authParam?: string }) {
  const { dir, language, t } = useLanguage();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState<{ open: boolean; tab: "login" | "register"; regType?: string }>({ open: false, tab: "login" });
  const [regType, setRegType] = useState("");
  const [slideIdx, setSlideIdx] = useState(0);
  const [autoPaused, setAutoPaused] = useState(false);

  useEffect(() => {
    if (authParam === "register") {
      setRegType("")
      setAuthOpen({ open: true, tab: "register" })
    } else if (authParam === "login") {
      setRegType("")
      setAuthOpen({ open: true, tab: "login" })
    }
  }, [authParam])

  const slides = data.slides;
  const next = useCallback(() => setSlideIdx((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setSlideIdx((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (autoPaused || slides.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [autoPaused, next, slides.length]);

  const gridCols = `${leftCollapsed ? "48px" : "260px"} minmax(0,1fr) ${rightCollapsed ? "48px" : "260px"}`;

  const cfg = data.config;
  const logoUrl = cfg.logoUrl || "/logo/abc-logo-white.svg";

  const leftTop = data.zones.LEFT_TOP;
  const leftBottom = data.zones.LEFT_BOTTOM;
  const rightTop = data.zones.RIGHT_TOP;
  const rightBottom = data.zones.RIGHT_BOTTOM;

  return (
    <div dir={dir} className="flex flex-col min-h-screen bg-surface-50">
      <div className="flex flex-1 min-w-0">
      {/* ============ LEFT SIDEBAR ============ */}
      {leftCollapsed ? (
        <aside
          className="w-12 shrink-0 bg-primary-500 border-r border-primary-800 flex items-center justify-center"
        >
          <button
            onClick={() => setLeftCollapsed(false)}
            className="p-2 text-primary-100 hover:text-white hover:bg-primary-600 rounded-none transition-colors"
            aria-label="expand"
            title="expand"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        </aside>
      ) : (
        <aside
          className="w-[260px] shrink-0 bg-primary-500 text-white border-r border-primary-800 flex flex-col overflow-hidden"
        >
          <div className="shrink-0 p-4 flex flex-col items-center gap-3">
            <Image
              src={logoUrl}
              alt={t("appName")}
              width={180}
              height={82}
              priority
              className="w-[180px] h-auto object-contain"
            />
            <div className="text-center px-3">
              <p className="text-sm font-bold text-accent-400">{pick(cfg.heroTitle, language)}</p>
              <p className="text-xs text-primary-100 mt-1 leading-relaxed">
                {pick(cfg.heroDescription, language)}
              </p>
            </div>
          </div>

          <div className="shrink-0 border-t border-primary-700/60" />
          <div className="min-h-0 flex-1 grid grid-rows-2 divide-y divide-primary-700/60">
            <ZoneContent zone={leftTop} lang={language} />
            <ZoneContent zone={leftBottom} lang={language} />
          </div>

          <div className="shrink-0 border-t border-primary-700/60 p-1">
            <button
              onClick={() => setLeftCollapsed(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-none text-primary-100 hover:text-white hover:bg-primary-600 transition-colors text-xs"
              aria-label={t("collapse")}
            >
              <PanelLeftClose className="w-4 h-4" />
              <span>{t("collapse")}</span>
            </button>
          </div>
        </aside>
      )}

      {/* ============ HEADER (right side top) ============ */}
      <div className="flex flex-1 flex-col min-w-0">
      <header
        className="h-12 bg-white border-b border-surface-200 flex items-center gap-3 px-3 overflow-visible"
      >
        {leftCollapsed && (
          <Link href="/" className="shrink-0">
            <Image src="/logo/abc-logo-mark.svg" alt={t("appName")} width={32} height={32} className="w-8 h-8" />
          </Link>
        )}

        <nav className="flex flex-1 items-center gap-1 overflow-visible">
          {data.menus.map((menu) => (
            <div
              key={menu.key}
              className="relative shrink-0"
              onMouseEnter={() => setOpenMenu(menu.key)}
              onMouseLeave={() => setOpenMenu((c) => (c === menu.key ? null : c))}
            >
              <button
                onClick={() => setOpenMenu((c) => (c === menu.key ? null : menu.key))}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-none text-sm font-medium transition-colors ${
                  openMenu === menu.key
                    ? "bg-primary-50 text-primary-600"
                    : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                }`}
                aria-haspopup="menu"
                aria-expanded={openMenu === menu.key}
              >
                {pick(menu.label, language)}
                <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === menu.key ? "rotate-180" : ""}`} />
              </button>
              {openMenu === menu.key && (
                <div className="absolute top-full left-0 w-52 z-50">
                  <div className="pt-2">
                    <div className="bg-white rounded-none shadow-2xl border border-surface-200 py-1.5">
                      {menu.items.map((item, i) => (
                        <Link
                          key={menu.key + i}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-surface-700 hover:bg-primary-50 hover:text-primary-600"
                        >
                          {pick(item.label, language)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          {cfg.showLanguage && <LanguageSwitcher />}
          {cfg.showLogin && (
            <button
              onClick={() => { setRegType(""); setAuthOpen({ open: true, tab: "login" }) }}
              className="hidden sm:block px-3 py-1.5 text-sm font-medium text-surface-700 hover:text-surface-900"
            >
              {t("login")}
            </button>
          )}
          {cfg.showRegister && (
            <div
              className="relative shrink-0"
              onMouseEnter={() => setOpenMenu("__register")}
              onMouseLeave={() => setOpenMenu((c) => (c === "__register" ? null : c))}
            >
              <button
                onClick={() => setOpenMenu((c) => (c === "__register" ? null : "__register"))}
                className="flex items-center gap-1 px-4 py-1.5 text-sm font-bold bg-secondary-500 text-white rounded-none hover:bg-secondary-600 transition-colors"
              >
                {t("register")}
                <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === "__register" ? "rotate-180" : ""}`} />
              </button>
              {openMenu === "__register" && (
                <div className="absolute top-full right-0 w-52 z-50" style={{ left: 0, right: "auto" }}>
                  <div className="pt-2">
                    <div className="bg-white rounded-none shadow-2xl border border-surface-200 py-1.5">
                      {data.registerItems.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setRegType(pick(item.label, "ar"))
                            setAuthOpen({ open: true, tab: "register" })
                          }}
                          className="block w-full text-start px-4 py-2 text-sm text-surface-700 hover:bg-primary-50 hover:text-primary-600"
                        >
                          {pick(item.label, language)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ============ MIDDLE + RIGHT REGION (carousel | right col, then ads) ============ */}
      <div className="flex flex-col">
        {/* Row A: carousel + right column (same height) */}
        <div className="grid" style={{ gridTemplateColumns: rightCollapsed ? "1fr 48px" : "1fr 260px" }}>
          {/* Carousel (middle) */}
          <div
            className="relative h-[420px] bg-primary-600"
            onMouseEnter={() => setAutoPaused(true)}
            onMouseLeave={() => setAutoPaused(false)}
          >
            {slides.length > 0 && (
              <div className="absolute inset-0">
                <Image
                  key={slideIdx}
                  src={slides[slideIdx].imageUrl}
                  alt={pick(slides[slideIdx].title, language)}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1600px) 60vw, 900px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-transparent to-transparent" />
              </div>
            )}
            {slides.length > 0 && (
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h2 className="text-xl md:text-2xl font-bold mb-1">
                  {pick(slides[slideIdx].title, language)}
                </h2>
                {pick(slides[slideIdx].subtitle, language) && (
                  <p className="text-sm text-white/80 max-w-lg">
                    {pick(slides[slideIdx].subtitle, language)}
                  </p>
                )}
                {slides[slideIdx].link && (
                  <Link
                    href={slides[slideIdx].link}
                    className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-secondary-500 text-white text-sm font-bold hover:bg-secondary-600 transition-colors rounded-none"
                  >
                    {pick(cfg.ctaLabel, language)}
                    {dir === "rtl" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </Link>
                )}
              </div>
            )}
            {slides.length > 0 && (
              <>
                <button
                  onClick={prev}
                  className="absolute start-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white hover:bg-black/50 rounded-none transition-colors"
                  aria-label="prev"
                >
                  {dir === "rtl" ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={next}
                  className="absolute end-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white hover:bg-black/50 rounded-none transition-colors"
                  aria-label="next"
                >
                  {dir === "rtl" ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </>
            )}
            <AuthModal
              open={authOpen.open}
              initialTab={authOpen.tab}
              initialRegType={regType}
              onClose={() => { setAuthOpen({ open: false, tab: "login" }); setRegType("") }}
            />
          </div>

          {/* Right column (same height as carousel) */}
          {rightCollapsed ? (
            <aside className="bg-white border-s border-surface-200 flex items-center justify-center">
              <button
                onClick={() => setRightCollapsed(false)}
                className="p-2 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-none transition-colors"
                aria-label="expand"
                title="expand"
              >
                <PanelRightOpen className="w-5 h-5" />
              </button>
            </aside>
          ) : (
            <aside className="bg-primary-500 text-white border-s border-primary-800 grid grid-rows-2 divide-y divide-primary-700/60 overflow-hidden">
              <ZoneContent zone={rightTop} lang={language} />
              <ZoneContent zone={rightBottom} lang={language} />
            </aside>
          )}
        </div>

        {/* Row B: ads area — the left column ends here */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-surface-200 p-px h-20 shrink-0">
          {data.ads.map((ad, i) => (
            <div key={i} className="bg-white flex items-center justify-center h-full">
              {ad.imageUrl ? (
                <Link href={ad.link || "/"} className="block w-full h-full">
                  <Image
                    src={ad.imageUrl}
                    alt={pick(ad.title, language) || "ad"}
                    width={320}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <div className="w-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 h-full">
                  <p className="text-xs font-bold text-accent-400 px-2 text-center">
                    {pick(ad.title, language) || "Ad"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>

      {/* ============ SCREEN 2: full-width services strip + vertical ad rail ============ */}
      <div className="grid" style={{ gridTemplateColumns: rightCollapsed ? "1fr 48px" : "1fr 260px" }}>
        <div className="bg-white border-t border-surface-200 p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-surface-200 p-px">
            {data.menus.map((menu) => (
              <div key={menu.key} className="bg-white p-3">
                <p className="text-xs font-bold text-primary-600 mb-2">{pick(menu.label, language)}</p>
                <ul className="space-y-1">
                  {menu.items.slice(0, 4).map((item, i) => (
                    <li key={menu.key + i}>
                      <Link href={item.href} className="block text-xs text-surface-600 hover:text-primary-600">
                        {pick(item.label, language)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col bg-white border-s border-t border-surface-200">
          {data.ads.map((ad, i) => (
            <div key={i} className="flex-1 min-h-0 border-b border-surface-200 last:border-b-0">
              {ad.imageUrl ? (
                <Link href={ad.link || "/"} className="block w-full h-full">
                  <Image
                    src={ad.imageUrl}
                    alt={pick(ad.title, language) || "ad"}
                    width={260}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
                  <p className="text-xs font-bold text-accent-400 px-2 text-center">
                    {pick(ad.title, language) || "Ad"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ============ FOOTER (full width, very bottom) ============ */}
      <footer className="bg-primary-600 text-primary-100 flex items-center justify-between px-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <Image src="/logo/abc-logo-mark.svg" alt="" width={20} height={20} className="w-5 h-5" />
          <span>{pick(cfg.footerText, language)}</span>
        </div>
        <div className="flex items-center gap-4">
          {data.footerLinks.map((fl, i) => (
            <Link key={i} href={fl.href} className="hover:text-white">
              {pick(fl.label, language)}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}