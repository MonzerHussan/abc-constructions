import { prisma } from "@/lib/prisma";
import {
  HOMEPAGE_DEFAULTS,
  ZONE_DEFAULTS,
  SLIDE_DEFAULTS,
  MENU_DEFAULTS,
  REGISTER_ITEMS_DEFAULTS,
  FOOTER_LINKS_DEFAULTS,
  ZONE_LOCATIONS,
} from "@/lib/homepage-defaults";

export type Localized = Record<string, string>;

export interface HomepageData {
  config: {
    logoUrl: string;
    ctaLabel: Localized;
    ctaHref: string;
    heroTitle: Localized;
    heroSubtitle: Localized;
    heroDescription: Localized;
    footerText: Localized;
    showLanguage: boolean;
    showLogin: boolean;
    showRegister: boolean;
  };
  zones: {
    LEFT_TOP: Zone;
    LEFT_BOTTOM: Zone;
    RIGHT_TOP: Zone;
    RIGHT_BOTTOM: Zone;
  };
  slides: Slide[];
  menus: { key: string; label: Localized; items: { label: Localized; href: string }[] }[];
  registerItems: { label: Localized; href: string }[];
  footerLinks: { label: Localized; href: string }[];
  ads: { title: Localized; imageUrl: string; link: string }[];
}

export interface Zone {
  contentType: "TEXT" | "IMAGE" | "VIDEO";
  title: Localized;
  body: Localized;
  mediaUrl: string;
  link: string;
}

export interface Slide {
  title: Localized;
  subtitle: Localized;
  imageUrl: string;
  link: string;
}

function norm(text: Localized | null | undefined): Localized {
  return {
    ar: text?.ar ?? "",
    en: text?.en ?? "",
    ur: text?.ur ?? "",
  };
}

export async function getHomepageData(): Promise<HomepageData> {
  const [config, zones, slides, menus, menuItems, footerLinks, ads] = await Promise.all([
    prisma.homepageConfig.findFirst({ where: { key: "main" } }),
    prisma.homepageZone.findMany({ orderBy: { order: "asc" } }),
    prisma.homepageSlide.findMany({ where: { enabled: true }, orderBy: { order: "asc" } }),
    prisma.headerMenu.findMany({ where: { enabled: true }, orderBy: { order: "asc" } }),
    prisma.headerMenuItem.findMany({ where: { enabled: true }, orderBy: { order: "asc" } }),
    prisma.footerLink.findMany({ where: { enabled: true }, orderBy: { order: "asc" } }),
    prisma.homepageAd.findMany({ where: { enabled: true }, orderBy: { order: "asc" } }),
  ]);

  // Config: DB row or defaults
  const hasConfig = config && (config.logoUrl || config.ctaLabel);
  const cfg = {
    logoUrl: (config?.logoUrl as string) || HOMEPAGE_DEFAULTS.logoUrl,
    ctaLabel: (config?.ctaLabel as Localized | null) || HOMEPAGE_DEFAULTS.ctaLabel,
    ctaHref: config?.ctaHref || HOMEPAGE_DEFAULTS.ctaHref,
    heroTitle: norm(config?.heroTitle as Localized | null).ar ? (config!.heroTitle as Localized) : HOMEPAGE_DEFAULTS.heroTitle,
    heroSubtitle: norm(config?.heroSubtitle as Localized | null).ar ? (config!.heroSubtitle as Localized) : HOMEPAGE_DEFAULTS.heroSubtitle,
    heroDescription: norm(config?.heroDescription as Localized | null).ar ? (config!.heroDescription as Localized) : HOMEPAGE_DEFAULTS.heroDescription,
    footerText: norm(config?.footerText as Localized | null).ar ? (config!.footerText as Localized) : HOMEPAGE_DEFAULTS.footerText,
    showLanguage: config?.showLanguage ?? HOMEPAGE_DEFAULTS.showLanguage,
    showLogin: config?.showLogin ?? HOMEPAGE_DEFAULTS.showLogin,
    showRegister: config?.showRegister ?? HOMEPAGE_DEFAULTS.showRegister,
  };

  // Zones: use DB rows if any exist, else defaults
  const zoneMap = new Map<string, Zone>();
  for (const z of zones) {
    zoneMap.set(z.location, {
      contentType: z.contentType as Zone["contentType"],
      title: norm(z.title as Localized | null),
      body: norm(z.body as Localized | null),
      mediaUrl: z.mediaUrl || "",
      link: z.link || "",
    });
  }
  const resolvedZones = {} as HomepageData["zones"];
  for (const loc of ZONE_LOCATIONS) {
    const hasDb = zoneMap.has(loc) && zoneMap.get(loc)!.title.ar;
    resolvedZones[loc] = hasDb
      ? zoneMap.get(loc)!
      : {
          contentType: ZONE_DEFAULTS[loc].contentType,
          title: ZONE_DEFAULTS[loc].title,
          body: ZONE_DEFAULTS[loc].body,
          mediaUrl: ZONE_DEFAULTS[loc].mediaUrl,
          link: ZONE_DEFAULTS[loc].link,
        };
  }

  // Slides: DB rows or defaults
  const resolvedSlides = slides.length
    ? slides.map((s) => ({
        title: norm(s.title as Localized | null),
        subtitle: norm(s.subtitle as Localized | null),
        imageUrl: s.imageUrl,
        link: s.link || "",
      }))
    : SLIDE_DEFAULTS;

  // Menus: DB or defaults
  const itemMap = new Map<string, { label: Localized; href: string }[]>();
  for (const it of menuItems) {
    const arr = itemMap.get(it.menuId) ?? [];
    arr.push({ label: norm(it.label as Localized | null), href: it.href });
    itemMap.set(it.menuId, arr);
  }
  const dbMenus = menus.map((m) => ({
    key: m.key,
    label: norm(m.label as Localized | null),
    items: itemMap.get(m.id) ?? [],
  }));
  const hasAnyMenu = dbMenus.length > 0 && dbMenus.every((m) => m.label.ar);
  const resolvedMenus = hasAnyMenu ? dbMenus : MENU_DEFAULTS;

  // Register items: from the register menu if the admin created one, else defaults
  const registerMenu = resolvedMenus.find((m) => m.key === "register");
  const resolvedRegisterItems = registerMenu?.items?.length
    ? registerMenu.items
    : REGISTER_ITEMS_DEFAULTS;

  // Footer links: DB or defaults
  const resolvedFooterLinks = footerLinks.length
    ? footerLinks.map((l) => ({ label: norm(l.label as Localized | null), href: l.href }))
    : FOOTER_LINKS_DEFAULTS;

  // Ads: DB or quick defaults
  const resolvedAds = ads.length
    ? ads.map((a) => ({ title: norm(a.title as Localized | null), imageUrl: a.imageUrl || "", link: a.link || "" }))
    : [
        {
          title: { ar: "مشاريع إنشائية", en: "Construction Projects", ur: "تعمیراتی منصوبے" },
          imageUrl: "/ads/ad-1.png",
          link: "/projects/ABC/projects",
        },
        {
          title: { ar: "مواد البناء", en: "Building Materials", ur: "تعمیراتی سامان" },
          imageUrl: "/ads/ad-2.png",
          link: "/projects/ABC/marketplace",
        },
        {
          title: { ar: "معدات وآليات", en: "Equipment", ur: "مشینری" },
          imageUrl: "/ads/ad-3.png",
          link: "/projects/ABC/tenders/materials",
        },
      ];

  return {
    config: cfg,
    zones: resolvedZones,
    slides: resolvedSlides,
    menus: resolvedMenus,
    registerItems: resolvedRegisterItems,
    footerLinks: resolvedFooterLinks,
    ads: resolvedAds,
  };
}

// used to indicate whether CMS content exists (for the admin UI banner)
export async function hasProjectedHomepageContent(): Promise<boolean> {
  const [zones, slides, menus] = await Promise.all([
    prisma.homepageZone.findMany({ select: { id: true } }),
    prisma.homepageSlide.findMany({ select: { id: true } }),
    prisma.headerMenu.findMany({ select: { id: true } }),
  ]);
  return zones.length > 0 || slides.length > 0 || menus.length > 0;
}

export function getZoneByLocation(zones: HomepageData["zones"], location: keyof HomepageData["zones"]): Zone {
  return zones[location];
}