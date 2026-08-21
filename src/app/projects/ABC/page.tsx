"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Play,
  ChevronDown,
  Building2,
  ShieldCheck,
  Smartphone,
  LogOut,
} from "lucide-react";
import HomepageCarousel from "@/components/homepage/HomepageCarousel";
import VideoCard from "@/components/homepage/VideoCard";
import AdsBanner from "@/components/homepage/AdsBanner";
import AdCard, { adGridClass } from "@/components/homepage/AdCard";
import ZoneCard from "@/components/homepage/ZoneCard";
import RegisterInline from "@/components/homepage/RegisterInline";
import LoginInline from "@/components/homepage/LoginInline";
import SupplierTraderHint from "@/components/homepage/SupplierTraderHint";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";
import { HOMEPAGE_DEFAULTS, mergeHomepageData, type HomepageData } from "@/lib/homepage-defaults";
import type { TranslationKey } from "@/lib/translations";
import { useSearchParams, useRouter } from "next/navigation";
import AbcLogo from "@/components/AbcLogo";
import { platformRegisterUrl } from "@/lib/homepage-auth-routes";
import { cn } from "@/lib/utils";

interface LeftBlockLocalized {
  type: string;
  title: string;
  body: string;
  imageUrl: string;
  videoUrl: string;
  posterUrl: string | null;
  linkUrl: string | null;
  enabled: boolean;
}

interface BelowAdsContent {
  showHighlights: boolean;
  highlightsTitle: string;
  showStats: boolean;
  stats: Array<{ value: string; label: string }>;
  showVideosSection: boolean;
  videosSectionTitle: string;
  showFooter: boolean;
  footerAbout: string;
  footerEmail: string | null;
  footerPhone: string | null;
  footerAddress: string;
}

const CREATE_ACCOUNT_ROLES: { labelKey: TranslationKey; descKey?: TranslationKey }[] = [
  { labelKey: "accountCategoryEntity" },
  { labelKey: "accountCategoryCompany" },
  { labelKey: "accountCategoryOwner" },
  { labelKey: "accountCategoryConsultant" },
  { labelKey: "accountCategoryContractor" },
  { labelKey: "accountCategorySubcontractor" },
  { labelKey: "accountCategorySupplier", descKey: "obTypeSupplierDesc" },
  { labelKey: "accountCategoryTrader", descKey: "obTypeTraderDesc" },
  { labelKey: "accountCategoryIndividual" },
];

import {
  LABEL_KEY_TO_PLATFORM_ACCOUNT_TYPE,
  platformAccountTypeToUserRole,
} from "@/lib/account-types";

const NAV_GROUPS: {
  key: string;
  labelKey: TranslationKey;
  items: { href: string; labelKey: TranslationKey }[];
}[] = [
  {
    key: "bids",
    labelKey: "navBids",
    items: [
      { href: "/projects/ABC/projects", labelKey: "headProjects" },
      { href: "/projects/ABC/marketplace", labelKey: "headMaterials" },
      { href: "/projects/ABC/delivery", labelKey: "headDelivery" },
      { href: "/projects/ABC/marketplace", labelKey: "headProducts" },
    ],
  },
  {
    key: "market",
    labelKey: "navMarketplaceTitle",
    items: [
      { href: "/projects/ABC/projects", labelKey: "headProjects" },
      { href: "/projects/ABC/marketplace", labelKey: "headMaterials" },
      { href: "/projects/ABC/delivery", labelKey: "headDelivery" },
      { href: "/projects/ABC/marketplace", labelKey: "headProducts" },
    ],
  },
  {
    key: "community",
    labelKey: "navCommunity",
    items: [
      { href: "/projects/ABC/jobs", labelKey: "headJobs" },
      { href: "/projects/ABC/training", labelKey: "headTraining" },
    ],
  },
];

import { HEADER_CONTROL, HEADER_LOGOUT_BUTTON } from "@/lib/header-control-styles";

function NavDropdown({ dir }: { dir: "rtl" | "ltr" }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="flex items-center gap-1">
      {NAV_GROUPS.map((g) => (
        <div key={g.key} className="relative">
          <button
            onClick={() => setOpen(open === g.key ? null : g.key)}
            className={cn("flex items-center gap-1.5 rounded-none", HEADER_CONTROL, "text-surface-700 hover:text-secondary-600 hover:bg-secondary-50")}
            aria-expanded={open === g.key}
          >
            {t(g.labelKey)}
            <ChevronDown className={cn("w-4 h-4 transition-transform", open === g.key && "rotate-180")} />
          </button>
          {open === g.key && (
            <div
              dir={dir}
              className="absolute top-full start-0 mt-2 w-60 bg-white rounded-none shadow-lg border border-surface-100 py-2 z-50"
            >
              <div className="px-4 py-2 border-b border-surface-100 mb-1">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide">{t(g.labelKey)}</p>
              </div>
              {g.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(null)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 shrink-0" />
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CreateAccountMenu({ dir, onSelect }: { dir: "rtl" | "ltr"; onSelect: (labelKey: TranslationKey) => void }) {
  const { t } = useLanguage();
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
        onClick={() => setOpen(!open)}
        className={cn("flex items-center gap-1.5 rounded-none bg-secondary-500 text-white font-semibold text-xs px-2.5 py-1 shadow-md shadow-secondary-500/20 hover:bg-secondary-600 transition-colors", HEADER_CONTROL)}
        aria-expanded={open}
      >
        {t("createAccount")}
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          dir={dir}
          className="absolute top-full end-0 mt-2 w-60 bg-white rounded-none shadow-lg border border-surface-100 py-2 z-50"
        >
          <div className="px-4 py-2 border-b border-surface-100 mb-1">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide">{t("register")}</p>
          </div>
          {CREATE_ACCOUNT_ROLES.map((item) => (
            <button
              key={item.labelKey}
              onClick={() => {
                setOpen(false);
                onSelect(item.labelKey);
              }}
              className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors text-start"
            >
              <span className="flex items-center gap-3 w-full">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 shrink-0" />
                {t(item.labelKey)}
              </span>
              {item.descKey ? (
                <span className="text-[10px] text-surface-500 font-normal ps-5 leading-snug">
                  {t(item.descKey)}
                </span>
              ) : null}
            </button>
          ))}
          <div className="mx-3 mt-1 mb-0.5 border-t border-surface-100 pt-2">
            <SupplierTraderHint />
          </div>
        </div>
      )}
    </div>
  );
}

function AccountMenu({ dir, onLogin, onRegisterSelect }: { dir: "rtl" | "ltr"; onLogin: () => void; onRegisterSelect: (labelKey: TranslationKey) => void }) {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const loggedIn = status === "authenticated";
  const name = session?.user?.name;
  const email = session?.user?.email;

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
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-none bg-white/10 border border-white/15 p-2 w-full text-left hover:bg-white/15 transition-colors"
        aria-expanded={open}
      >
        <div className="w-11 h-11 rounded-full bg-secondary-500 flex items-center justify-center shrink-0">
          {loggedIn ? (
            <span className="text-white font-bold">{(name || email || "U").slice(0, 1).toUpperCase()}</span>
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{loggedIn ? name || email : t("guest")}</p>
          <p className="text-xs text-white/60 truncate">
            {loggedIn ? email : t("login")}
          </p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-white/70 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          dir={dir}
          className="absolute bottom-full start-0 mb-2 w-full min-w-[220px] bg-white rounded-none shadow-lg border border-surface-100 py-2 z-50"
        >
          {loggedIn ? (
            <>
              <div className="px-4 py-2 border-b">
                <p className="font-medium text-sm">{name || "مستخدم"}</p>
                <p className="text-xs text-surface-500">{email}</p>
              </div>
              <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors">
                <User className="w-4 h-4 text-surface-400" />
                {t("profile")}
              </Link>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors">
                <Building2 className="w-4 h-4 text-surface-400" />
                {t("dashboard")}
              </Link>
              <Link href="/projects/ABC/organization" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors">
                <Building2 className="w-4 h-4 text-surface-400" />
                {t("myOrganization")}
              </Link>
              <Link href="/projects/ABC/verification" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors">
                <ShieldCheck className="w-4 h-4 text-surface-400" />
                {t("verification")}
              </Link>
              <Link href="/projects/ABC/settings/mfa" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors">
                <Smartphone className="w-4 h-4 text-surface-400" />
                MFA
              </Link>
              <hr className="my-1" />
              <button onClick={() => signOut({ callbackUrl: "/projects/ABC" })} className="flex items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 w-full transition-colors">
                <LogOut className="w-4 h-4" />
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  onLogin();
                }}
                className="block w-full px-4 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50 transition-colors text-start"
              >
                {t("login")}
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onRegisterSelect("accountCategoryOwner");
                }}
                className="block w-full px-4 py-2.5 text-sm font-semibold text-secondary-600 hover:bg-secondary-50 transition-colors text-start"
              >
                {t("register")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-50" dir="rtl" />}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const { t, dir, language } = useLanguage();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const loggedIn = status === "authenticated";
  const [data, setData] = useState<HomepageData>(HOMEPAGE_DEFAULTS);
  const [pendingRegister, setPendingRegister] = useState<{
    role: string
    label: string
    categoryKey: TranslationKey
  } | null>(null)
  const [pendingLogin, setPendingLogin] = useState(false)
  const authPanelRef = useRef<HTMLDivElement>(null)

  function closeAuthPanel() {
    setPendingLogin(false)
    setPendingRegister(null)
    router.replace("/projects/ABC", { scroll: false })
  }

  function openRegisterFromCategory(labelKey: TranslationKey) {
    setPendingLogin(false);
    const accountType = LABEL_KEY_TO_PLATFORM_ACCOUNT_TYPE[labelKey];
    setPendingRegister({
      role: accountType ? platformAccountTypeToUserRole(accountType) : "INDIVIDUAL",
      label: t(labelKey),
      categoryKey: labelKey,
    });
  }

  useEffect(() => {
    const login = searchParams.get("login");
    const register = searchParams.get("register");
    const category = searchParams.get("category");

    if (login === "1") {
      setPendingRegister(null);
      setPendingLogin(true);
      return;
    }

    if (register === "1") {
      setPendingLogin(false);
      const labelKey = (
        category && category in LABEL_KEY_TO_PLATFORM_ACCOUNT_TYPE
          ? category
          : "accountCategoryOwner"
      ) as TranslationKey;
      const accountType = LABEL_KEY_TO_PLATFORM_ACCOUNT_TYPE[labelKey];
      setPendingRegister({
        role: accountType ? platformAccountTypeToUserRole(accountType) : "INDIVIDUAL",
        label: t(labelKey),
        categoryKey: labelKey,
      });
    }
  }, [searchParams, t]);

  useEffect(() => {
    if (!pendingLogin && !pendingRegister) return

    function handlePageButtonClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (authPanelRef.current?.contains(target)) return

      const clickedControl = target.closest("button, a, [role='button'], input[type='submit']")
      if (clickedControl) {
        closeAuthPanel()
      }
    }

    document.addEventListener("click", handlePageButtonClick, true)
    return () => document.removeEventListener("click", handlePageButtonClick, true)
  }, [pendingLogin, pendingRegister])

  useEffect(() => {
    fetch(`/api/homepage`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.data) setData(mergeHomepageData(res.data));
      })
      .catch(() => {});
  }, []);

  const zones = data.zones ?? HOMEPAGE_DEFAULTS.zones;
  const ads = data.ads ?? HOMEPAGE_DEFAULTS.ads;
  const slides = data.slides ?? HOMEPAGE_DEFAULTS.slides;
  const videos = data.videos ?? HOMEPAGE_DEFAULTS.videos;

  const c = data.content;
  const L = language;

  function handleCreateCategory(labelKey: TranslationKey) {
    openRegisterFromCategory(labelKey);
    router.replace(platformRegisterUrl(labelKey), { scroll: false });
  }

  function openLogin() {
    setPendingRegister(null);
    setPendingLogin(true);
    router.replace("/projects/ABC?login=1", { scroll: false });
  }

  // Left-column admin zone
  const lbBlock = (c as unknown as { leftBlock?: LeftBlockLocalized | undefined }).leftBlock as LeftBlockLocalized | undefined;
  const lbEnabled = lbBlock ? lbBlock.enabled : c.leftBlockEnabled;
  const lbType = lbBlock ? lbBlock.type : c.leftBlockType;
  const lbTitle = lbBlock
    ? lbBlock.title
    : L === "en"
      ? c.leftBlockTitleEn || c.leftBlockTitle
      : L === "ur"
        ? c.leftBlockTitleUr || c.leftBlockTitle
        : c.leftBlockTitle;
  const lbBody = lbBlock
    ? lbBlock.body
    : L === "en"
      ? c.leftBlockBodyEn || c.leftBlockBody
      : L === "ur"
        ? c.leftBlockBodyUr || c.leftBlockBody
        : c.leftBlockBody;
  const lbImageUrl = lbBlock ? lbBlock.imageUrl : c.leftBlockImageUrl;
  const lbVideoUrl = lbBlock ? lbBlock.videoUrl : c.leftBlockVideoUrl;
  const lbPosterUrl = lbBlock ? lbBlock.posterUrl : c.leftBlockPosterUrl;
  const lbLinkUrl = lbBlock ? lbBlock.linkUrl : c.leftBlockLinkUrl;

  // Below-ads sections (localized from the API)
  const belowRaw = (c as unknown as Partial<BelowAdsContent>);
  const below: BelowAdsContent = {
    showHighlights: belowRaw.showHighlights ?? true,
    highlightsTitle: belowRaw.highlightsTitle ?? "أبرز ما في المنصة",
    showStats: belowRaw.showStats ?? true,
    stats: belowRaw.stats ?? [
      { value: "2,500+", label: "مشاريع منجزة" },
      { value: "1,800+", label: "مقاولون موثوقون" },
      { value: "10,000+", label: "خامات" },
      { value: "3,200+", label: "عطاءات ممنوحة" },
    ],
    showVideosSection: belowRaw.showVideosSection ?? true,
    videosSectionTitle: belowRaw.videosSectionTitle ?? "اكتشف المنصة",
    showFooter: belowRaw.showFooter ?? true,
    footerAbout: belowRaw.footerAbout ?? "",
    footerEmail: belowRaw.footerEmail ?? null,
    footerPhone: belowRaw.footerPhone ?? null,
    footerAddress: belowRaw.footerAddress ?? "",
  };

  return (
    <div className="min-h-screen bg-surface-50" dir={dir}>
      {/* ===== Main screen (no vertical scroll, edge to edge) ===== */}
      <main className="max-w-[1600px] mx-auto lg:grid lg:grid-cols-[260px_1fr] lg:gap-1 lg:h-[100dvh]">
        {/* ===== LEFT COLUMN — full height from top of screen ===== */}
        <section className="flex flex-col justify-between gap-3 p-2 lg:p-2.5 gradient-hero text-white min-h-[420px] lg:min-h-full">
          {/* Logo — ABC All About Construction */}
          <div className="flex items-center">
            <AbcLogo
              background="dark"
              alt="ABC - All About Construction"
              width={220}
              height={120}
              priority
              className="w-full max-w-[220px] h-auto object-contain"
            />
          </div>

          {/* Admin-controlled interstitial: text / image / video */}
          <div className="flex-1 flex flex-col justify-center min-h-0">
            {lbEnabled && lbType === "video" && lbVideoUrl && (
              <a
                href={lbVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-none overflow-hidden border border-white/10 card-hover"
              >
                <div className="relative aspect-video bg-black">
                  {lbPosterUrl ? (
                    <Image src={lbPosterUrl} alt={lbTitle || "video"} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-900" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="w-14 h-14 bg-secondary-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </span>
                  </div>
                </div>
              </a>
            )}

            {lbEnabled && lbType === "image" && lbImageUrl &&
              (lbLinkUrl ? (
                <a
                  href={lbLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-none overflow-hidden border border-white/10 card-hover"
                >
                  <div className="relative aspect-square">
                    <Image src={lbImageUrl} alt={lbTitle || "image"} fill className="object-cover" />
                  </div>
                </a>
              ) : (
                <div className="rounded-none overflow-hidden border border-white/10">
                  <div className="relative aspect-square">
                    <Image src={lbImageUrl} alt={lbTitle || "image"} fill className="object-cover" />
                  </div>
                </div>
              ))}

            {lbEnabled && lbType === "text" && (lbTitle || lbBody) && (
              <div className="rounded-none border border-white/10 bg-white/10 p-2">
                {lbTitle && (
                  <p className="text-xs font-bold uppercase tracking-widest text-accent-400 mb-2">{lbTitle}</p>
                )}
                {lbBody && <p className="text-sm leading-relaxed text-white/75 line-clamp-6">{lbBody}</p>}
              </div>
            )}
          </div>

          {/* Guest / visitor button */}
          <AccountMenu dir={dir} onLogin={openLogin} onRegisterSelect={handleCreateCategory} />
        </section>

        {/* ===== MAIN AREA — full-width header (after left column), then middle + right columns ===== */}
        <div className="relative flex flex-col gap-1 py-2 lg:py-0 lg:min-h-0">
          <header className="relative z-20 flex items-center justify-between gap-2 bg-white/90 backdrop-blur rounded-none border border-surface-200 px-3 py-1.5 shadow-sm lg:min-h-0">
            <NavDropdown dir={dir} />
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="rounded-none">
                <LanguageSwitcher />
              </div>
              {loggedIn ? (
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/projects/ABC" })}
                  className={HEADER_LOGOUT_BUTTON}
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  {t("logout")}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={openLogin}
                    className={cn("rounded-none", HEADER_CONTROL, "text-surface-700 hover:text-secondary-600")}
                  >
                    {t("login")}
                  </button>
                  <CreateAccountMenu dir={dir} onSelect={handleCreateCategory} />
                </>
              )}
            </div>
          </header>

          <div className="grid flex-1 gap-1 lg:min-h-0 lg:grid-cols-[1fr_280px]">
            {/* Middle: auth panel → carousel → ads (same column width) */}
            <div className="relative flex flex-col gap-1 lg:min-h-0 flex-1">
              <div className="relative flex-1 overflow-hidden lg:min-h-0 gradient-hero rounded-none border-0">
                <div className="relative min-h-[380px] lg:h-full">
                  <HomepageCarousel slides={slides} dir={dir} fill />
                </div>
              </div>

              {ads.length > 0 && (
                <div className="shrink-0">
                  <div className={`grid gap-1 ${adGridClass(ads.length)}`}>
                    {ads.slice(0, 4).map((ad) => (
                      <AdCard key={ad.id} ad={ad} />
                    ))}
                  </div>
                </div>
              )}

              {(pendingLogin || pendingRegister) && (
                <div
                  className="absolute inset-0 z-30 flex items-start justify-center overflow-y-auto bg-black/55 backdrop-blur-[2px] p-2 pt-3"
                  onClick={closeAuthPanel}
                  role="presentation"
                >
                  <div ref={authPanelRef} className="w-full max-w-full" onClick={(e) => e.stopPropagation()}>
                    {pendingLogin ? (
                      <LoginInline
                        dir={dir}
                        onClose={closeAuthPanel}
                        onOpenRegister={(role, label, categoryKey) => {
                          setPendingLogin(false);
                          setPendingRegister({ role, label, categoryKey });
                        }}
                      />
                    ) : (
                      pendingRegister && (
                        <RegisterInline
                          key={pendingRegister.categoryKey}
                          dir={dir}
                          role={pendingRegister.role}
                          roleLabel={pendingRegister.label}
                          categoryKey={pendingRegister.categoryKey}
                          onClose={closeAuthPanel}
                          onOpenLogin={openLogin}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ===== RIGHT COLUMN — admin zones (1-3): text / image / video / mixed, 90° corners ===== */}
            <section className="flex flex-col gap-1 max-lg:mt-2">
              {zones.length > 0 ? (
                zones.map((zone) => (
                  <ZoneCard key={zone.id} zone={zone} className="flex-1 min-h-0" />
                ))
              ) : (
                <div className="flex-1 min-h-0 flex items-center justify-center bg-white border border-surface-200 rounded-none shadow-sm">
                  <p className="text-sm text-surface-400">{language === "en" ? "No zones configured" : "لا توجد مناطق مضبوطة"}</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* ===== After scroll: below-ads content (every section admin-controlled) ===== */}
      {below.showHighlights && (
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold text-primary-500">{below.highlightsTitle}</h2>
            </div>
            <HomepageCarousel slides={slides} dir={dir} />
          </div>
        </section>
      )}

      <AdsBanner ads={ads} />

      {/* Stats strip */}
      {below.showStats && (
        <section className="py-5 bg-white border-y border-surface-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              {below.stats.map((s) => (
                <div key={s.value}>
                  <p className="text-3xl font-bold text-accent-500">{s.value}</p>
                  <p className="text-sm text-surface-600">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Videos grid */}
      {below.showVideosSection && videos.length > 0 && (
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
            <h3 className="text-2xl font-bold text-primary-500 mb-3">{below.videosSectionTitle}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      {below.showFooter && (
      <footer className="bg-surface-900 text-surface-400 py-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AbcLogo background="dark" alt="ABC" width={64} height={64} className="w-16 h-16" />
              </div>
              <p className="text-sm">{below.footerAbout || t("appDescription")}</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-2">{t("services")}</h4>
              <ul className="space-y-1 text-sm">
                <li><Link href="/projects/ABC/tenders/projects" className="hover:text-white">{t("modProjectTenders")}</Link></li>
                <li><Link href="/projects/ABC/tenders/materials" className="hover:text-white">{t("modMaterialTenders")}</Link></li>
                <li><Link href="/projects/ABC/marketplace" className="hover:text-white">{t("modMarketplace")}</Link></li>
                <li><Link href="/projects/ABC/jobs" className="hover:text-white">{t("modJobs")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-2">{t("about")}</h4>
              <ul className="space-y-1 text-sm">
                <li><Link href="/about" className="hover:text-white">{t("about")}</Link></li>
                <li><Link href="/contact" className="hover:text-white">{t("contact")}</Link></li>
                <li><Link href="/terms" className="hover:text-white">{t("terms")}</Link></li>
                <li><Link href="/privacy" className="hover:text-white">{t("privacy")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-2">{t("contact")}</h4>
              <ul className="space-y-1 text-sm">
                {below.footerEmail && <li>{below.footerEmail}</li>}
                {below.footerPhone && <li>{below.footerPhone}</li>}
                <li>{below.footerAddress || (language === "en" ? "Riyadh, Saudi Arabia" : "الرياض، المملكة العربية السعودية")}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-surface-800 mt-4 pt-4 text-center text-sm">
            <p>© 2026 ABC - {t("appFullName")}. {t("allRights")}</p>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}