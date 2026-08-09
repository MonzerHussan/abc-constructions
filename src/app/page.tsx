"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  User,
  Play,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import HomepageCarousel from "@/components/homepage/HomepageCarousel";
import VideoCard from "@/components/homepage/VideoCard";
import AdsBanner from "@/components/homepage/AdsBanner";
import { useLanguage } from "@/lib/LanguageContext";
import { HOMEPAGE_DEFAULTS, type HomepageData } from "@/lib/homepage-defaults";
import { cn } from "@/lib/utils";

const HEADER_LINKS = [
  { href: "/tenders/projects", key: "bids", label: "Bids" },
  { href: "/marketplace", key: "market", label: "Market" },
  { href: "/training", key: "community", label: "Community" },
];

function RectPanel({
  className,
  children,
  label,
  dir,
}: {
  className?: string;
  children: React.ReactNode;
  label?: string;
  dir: "rtl" | "ltr";
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[1.25rem] border border-white/10", className)}>
      {label && (
        <span className="absolute top-3 start-3 z-10 text-[10px] font-bold uppercase tracking-widest text-white/40 bg-black/30 rounded-full px-2.5 py-1">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

function UserProfile({ dir }: { dir: "rtl" | "ltr" }) {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const loggedIn = status === "authenticated";
  const name = session?.user?.name;
  const email = session?.user?.email;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/15 p-3">
      <div className="w-11 h-11 rounded-full bg-secondary-500 flex items-center justify-center shrink-0">
        {loggedIn ? (
          <span className="text-white font-bold">
            {(name || email || "U").slice(0, 1).toUpperCase()}
          </span>
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate">
          {loggedIn ? name || email : t("guest")}
        </p>
        <p className="text-xs text-white/60 truncate">
          {loggedIn ? email : "Guest"}
        </p>
      </div>
      {loggedIn ? (
        <Link
          href="/account"
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          <User className="w-4 h-4" />
        </Link>
      ) : (
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary-500 text-white text-sm font-bold hover:bg-secondary-600 transition-colors"
        >
          {t("login")}
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const { t, dir, language } = useLanguage();
  const [data, setData] = useState<HomepageData>(HOMEPAGE_DEFAULTS);

  useEffect(() => {
    fetch(`/api/homepage`)
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.data) setData(res.data);
      })
      .catch(() => {});
  }, []);

  const c = data.content;
  const L = language;

  const introTitle = L === "en" ? c.introTitleEn : L === "ur" ? c.introTitleUr : c.introTitle;
  const introBody = L === "en" ? c.introBodyEn : L === "ur" ? c.introBodyUr : c.introBody;
  const visionTitle = L === "en" ? c.visionTitleEn : L === "ur" ? c.visionTitleUr : c.visionTitle;
  const visionBody = L === "en" ? c.visionBodyEn : L === "ur" ? c.visionBodyUr : c.visionBody;
  const primaryCta = L === "en" ? c.primaryCtaLabelEn : L === "ur" ? c.primaryCtaLabelUr : c.primaryCtaLabel;
  const secondaryCta = L === "en" ? c.secondaryCtaLabelEn : L === "ur" ? c.secondaryCtaLabelUr : c.secondaryCtaLabel;

  const firstVideo = data.videos[0];
  const firstAd = data.ads[0];
  const secondAd = data.ads[1];

  const headerLabels: Record<string, string> =
    L === "ar"
      ? { bids: "المناقصات", market: "السوق", community: "المجتمع" }
      : L === "ur"
        ? { bids: "مناقصات", market: "بازار", community: "کمیونٹی" }
        : { bids: "Bids", market: "Market", community: "Community" };

  return (
    <div className="min-h-screen bg-surface-50" dir={dir}>
      <Navbar />

      {/* ===== Main screen (no vertical scroll) ===== */}
      <main className="max-w-[1600px] mx-auto px-0 sm:px-3 lg:pt-3">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,340px)_1fr_minmax(240px,300px)] gap-0 lg:gap-4 lg:h-[calc(100dvh-6rem)]">
          {/* ===== LEFT COLUMN — full height (logo, CTA, dynamic content, profile) ===== */}
          <section className="flex flex-col justify-between gap-6 p-6 lg:p-8 rounded-none lg:rounded-3xl gradient-hero text-white min-h-[420px] lg:min-h-full">
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="ABC"
                  width={72}
                  height={72}
                  priority
                  className="w-18 h-18 rounded-2xl shadow-2xl ring-1 ring-white/20"
                />
                <span className="text-3xl font-extrabold tracking-tight text-white">ABC</span>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <Link
                  href={c.primaryCtaHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors shadow-lg shadow-secondary-500/25"
                >
                  {primaryCta}
                  <ChevronRight className={cn("w-4 h-4", dir === "rtl" && "rotate-180")} />
                </Link>
                <Link
                  href={c.secondaryCtaHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/25 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  {secondaryCta}
                </Link>
              </div>

              {/* Dynamic content block */}
              <div className="w-full p-4 rounded-2xl bg-white/10 border border-white/10">
                <p className="text-xs font-bold uppercase tracking-widest text-accent-400 mb-2">
                  {visionTitle}
                </p>
                <p className="text-sm leading-relaxed text-white/75 line-clamp-4">{visionBody}</p>
              </div>
            </div>

            {/* User profile */}
            <div className="pt-4">
              <UserProfile dir={dir} />
            </div>
          </section>

          {/* ===== RIGHT AREA (header on top, then Rect 2 + Rect 4/5) ===== */}
          <div className="flex flex-col gap-4 lg:min-h-full">
            {/* Header above right area — Bids | Market | Community */}
            <header className="flex items-center justify-between gap-4 bg-white/90 backdrop-blur rounded-xl border border-surface-200 px-4 py-3 shadow-sm">
              <nav className="flex items-center gap-1 overflow-x-auto">
                {HEADER_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-surface-700 hover:text-secondary-600 hover:bg-secondary-50 transition-colors whitespace-nowrap"
                  >
                    {headerLabels[link.key]}
                  </Link>
                ))}
              </nav>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-accent-600 bg-accent-50 rounded-full px-3 py-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                {language === "en" ? "Live" : "مباشر"}
              </span>
            </header>

            {/* Rect 2 (largest) fills remaining space between header and rect 3 */}
            <RectPanel
              label={language === "en" ? "Rect 2 — Media" : "المستطيل 2 — وسائط"}
              dir={dir}
              className="flex-1 lg:min-h-0 gradient-hero"
            >
              <div className="min-h-[380px] lg:h-full">
                <HomepageCarousel slides={data.slides} dir={dir} fill />
              </div>
            </RectPanel>

            {/* Rect 3 (purple) — bottom of right column, full header width */}
            <RectPanel
              label={language === "en" ? "Rect 3 — CTA" : "المستطيل 3 — دعوة"}
              dir={dir}
              className="flex-1 bg-[linear-gradient(135deg,var(--flagship-500),var(--flagship-700))]"
            >
              <div className="flex items-center gap-4 p-5 lg:p-6 text-white">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-extrabold mb-1">{introTitle}</h3>
                  <p className="text-sm text-white/80 line-clamp-2">{introBody}</p>
                </div>
                <Link
                  href={c.primaryCtaHref}
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-secondary-500 text-white rounded-xl font-bold text-sm hover:bg-secondary-600 transition-colors shadow-lg"
                >
                  {primaryCta}
                </Link>
              </div>
            </RectPanel>
          </div>

          {/* ===== RIGHT COLUMN (4 top, 5 bottom) — same width as left column ===== */}
          <section className="flex flex-col gap-4 lg:mt-0">
            {/* Rect 4 (top) */}
            <RectPanel
              label={language === "en" ? "Rect 4 — Video" : "المستطيل 4 — فيديو"}
              dir={dir}
              className="flex-1 bg-white"
            >
              {firstVideo ? (
                <VideoCard video={firstVideo} />
              ) : (
                <div className="aspect-video bg-surface-100 rounded-2xl flex items-center justify-center">
                  <Play className="w-10 h-10 text-surface-300" />
                </div>
              )}
            </RectPanel>

            {/* Rect 5 (bottom) */}
            <RectPanel
              label={language === "en" ? "Rect 5 — Ads" : "المستطيل 5 — إعلانات"}
              dir={dir}
              className="flex-1 bg-white"
            >
              {firstAd ? (
                <AdsBanner ads={[firstAd]} />
              ) : (
                <div className="h-36 bg-surface-100 rounded-2xl flex items-center justify-center text-sm text-surface-400">
                  No ads yet
                </div>
              )}
            </RectPanel>
          </section>
        </div>
      </main>

      {/* ===== After scroll: additional dynamic content only ===== */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-500">
              {language === "en" ? "Platform Highlights" : language === "ur" ? "پلیٹ فارم کی جھلکیاں" : "أبرز ما في المنصة"}
            </h2>
          </div>
          <HomepageCarousel slides={data.slides} dir={dir} />
        </div>
      </section>

      <AdsBanner ads={data.ads} />

      {/* Stats strip — additional dynamic section */}
      <section className="py-10 bg-white border-y border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-accent-500">2,500+</p>
              <p className="text-sm text-surface-600">{language === "en" ? "Completed projects" : "مشروع مكتمل"}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent-500">1,800+</p>
              <p className="text-sm text-surface-600">{language === "en" ? "Verified contractors" : "مقاول موثّق"}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent-500">10,000+</p>
              <p className="text-sm text-surface-600">{language === "en" ? "Materials" : "منتج متوفر"}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent-500">3,200+</p>
              <p className="text-sm text-surface-600">{language === "en" ? "Awarded bids" : "مناقصة منجزة"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects / videos additional */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-primary-500 mb-6">
            {language === "en" ? "Discover the Platform" : "تعرّف على المنصة"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 text-surface-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="ABC" width={64} height={64} className="w-16 h-16" />
              </div>
              <p className="text-sm">{t("appDescription")}</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t("services")}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/tenders/projects" className="hover:text-white">{t("modProjectTenders")}</Link>
                </li>
                <li>
                  <Link href="/tenders/materials" className="hover:text-white">{t("modMaterialTenders")}</Link>
                </li>
                <li>
                  <Link href="/marketplace" className="hover:text-white">{t("modMarketplace")}</Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-white">{t("modJobs")}</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t("about")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">{t("about")}</Link></li>
                <li><Link href="/contact" className="hover:text-white">{t("contact")}</Link></li>
                <li><Link href="/terms" className="hover:text-white">{t("terms")}</Link></li>
                <li><Link href="/privacy" className="hover:text-white">{t("privacy")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t("contact")}</h4>
              <ul className="space-y-2 text-sm">
                <li>info@abc-constructions.com</li>
                <li>+966 50 000 0000</li>
                <li>{language === "en" ? "Riyadh, Saudi Arabia" : "الرياض، المملكة العربية السعودية"}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-surface-800 mt-8 pt-8 text-center text-sm">
            <p>© 2026 ABC - {t("appFullName")}. {t("allRights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}