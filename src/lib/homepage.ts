import { prisma } from "@/lib/prisma";
import { HOMEPAGE_DEFAULTS, type HomepageData } from "@/lib/homepage-defaults";

function pickLocale<T extends string | null>(
  ar: T,
  en: T,
  ur: T,
  language: "ar" | "en" | "ur",
): T {
  if (language === "en") return en ?? ar;
  if (language === "ur") return ur ?? ar;
  return ar;
}

export interface LocalizedHomepageData {
  content: {
    introTitle: string;
    introBody: string;
    visionTitle: string;
    visionBody: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    leftBlock: {
      type: string;
      title: string;
      body: string;
      imageUrl: string;
      videoUrl: string;
      posterUrl: string | null;
      linkUrl: string | null;
      enabled: boolean;
    };
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
  };
  slides: Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    videoUrl: string | null;
    posterUrl: string | null;
    linkUrl: string | null;
  }>;
  videos: Array<{
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    posterUrl: string | null;
  }>;
  ads: Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    body: string;
    imageUrl: string;
    videoUrl: string | null;
    posterUrl: string | null;
    linkUrl: string | null;
    animation: string;
  }>;
  zones: Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    body: string;
    imageUrl: string;
    videoUrl: string | null;
    posterUrl: string | null;
    linkUrl: string | null;
    animation: string;
  }>;
}

export async function getHomepageData(
  language: "ar" | "en" | "ur" = "ar",
): Promise<LocalizedHomepageData> {
  const [contentRow, slides, videos, ads, zones] = await Promise.all([
    prisma.homepageContent.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.carouselSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.videoSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.ad.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.homepageZone.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const d = HOMEPAGE_DEFAULTS;
  const content = contentRow ?? d.content;

  const localizedContent = {
    introTitle: pickLocale(
      content.introTitle,
      content.introTitleEn ?? content.introTitle,
      content.introTitleUr ?? content.introTitle,
      language,
    ),
    introBody: pickLocale(
      content.introBody,
      content.introBodyEn ?? content.introBody,
      content.introBodyUr ?? content.introBody,
      language,
    ),
    visionTitle: pickLocale(
      content.visionTitle,
      content.visionTitleEn ?? content.visionTitle,
      content.visionTitleUr ?? content.visionTitle,
      language,
    ),
    visionBody: pickLocale(
      content.visionBody,
      content.visionBodyEn ?? content.visionBody,
      content.visionBodyUr ?? content.visionBody,
      language,
    ),
    primaryCtaLabel: pickLocale(
      content.primaryCtaLabel,
      content.primaryCtaLabelEn ?? content.primaryCtaLabel,
      content.primaryCtaLabelUr ?? content.primaryCtaLabel,
      language,
    ),
    primaryCtaHref: content.primaryCtaHref,
    secondaryCtaLabel: pickLocale(
      content.secondaryCtaLabel,
      content.secondaryCtaLabelEn ?? content.secondaryCtaLabel,
      content.secondaryCtaLabelUr ?? content.secondaryCtaLabel,
      language,
    ),
    secondaryCtaHref: content.secondaryCtaHref,
    leftBlock: {
      type: content.leftBlockType ?? "text",
      title: pickLocale(
        content.leftBlockTitle ?? "",
        content.leftBlockTitleEn ?? content.leftBlockTitle ?? "",
        content.leftBlockTitleUr ?? content.leftBlockTitle ?? "",
        language,
      ),
      body: pickLocale(
        content.leftBlockBody ?? "",
        content.leftBlockBodyEn ?? content.leftBlockBody ?? "",
        content.leftBlockBodyUr ?? content.leftBlockBody ?? "",
        language,
      ),
      imageUrl: content.leftBlockImageUrl ?? "",
      videoUrl: content.leftBlockVideoUrl ?? "",
      posterUrl: content.leftBlockPosterUrl ?? null,
      linkUrl: content.leftBlockLinkUrl ?? null,
      enabled: content.leftBlockEnabled ?? true,
    },
    showHighlights: content.showHighlights ?? true,
    highlightsTitle: pickLocale(
      content.highlightsTitle,
      content.highlightsTitleEn ?? content.highlightsTitle,
      content.highlightsTitleUr ?? content.highlightsTitle,
      language,
    ),
    showStats: content.showStats ?? true,
    stats: [
      {
        value: content.stat1Value ?? "2,500+",
        label: pickLocale(
          content.stat1Label,
          content.stat1LabelEn ?? content.stat1Label,
          content.stat1LabelUr ?? content.stat1Label,
          language,
        ),
      },
      {
        value: content.stat2Value ?? "1,800+",
        label: pickLocale(
          content.stat2Label,
          content.stat2LabelEn ?? content.stat2Label,
          content.stat2LabelUr ?? content.stat2Label,
          language,
        ),
      },
      {
        value: content.stat3Value ?? "10,000+",
        label: pickLocale(
          content.stat3Label,
          content.stat3LabelEn ?? content.stat3Label,
          content.stat3LabelUr ?? content.stat3Label,
          language,
        ),
      },
      {
        value: content.stat4Value ?? "3,200+",
        label: pickLocale(
          content.stat4Label,
          content.stat4LabelEn ?? content.stat4Label,
          content.stat4LabelUr ?? content.stat4Label,
          language,
        ),
      },
    ],
    showVideosSection: content.showVideosSection ?? true,
    videosSectionTitle: pickLocale(
      content.videosSectionTitle,
      content.videosSectionTitleEn ?? content.videosSectionTitle,
      content.videosSectionTitleUr ?? content.videosSectionTitle,
      language,
    ),
    showFooter: content.showFooter ?? true,
    footerAbout: pickLocale(
      content.footerAbout ?? "",
      content.footerAboutEn ?? content.footerAbout ?? "",
      content.footerAboutUr ?? content.footerAbout ?? "",
      language,
    ),
    footerEmail: content.footerEmail ?? null,
    footerPhone: content.footerPhone ?? null,
    footerAddress: pickLocale(
      content.footerAddress ?? "",
      content.footerAddressEn ?? content.footerAddress ?? "",
      content.footerAddressUr ?? content.footerAddress ?? "",
      language,
    ),
  };

  const localizedSlides = slides.length > 0 ? slides : d.slides;
  const localizedVideos = videos.length > 0 ? videos : d.videos;
  const localizedAds = ads.length > 0 ? ads : d.ads;
  const localizedZones = zones.length > 0 ? zones : d.zones;

  return {
    content: localizedContent,
    slides: localizedSlides.map((s) => ({
      id: s.id,
      type: s.type ?? "image",
      title: pickLocale(s.title, s.titleEn ?? s.title, s.titleUr ?? s.title, language),
      subtitle: pickLocale(
        s.subtitle ?? "",
        s.subtitleEn ?? s.subtitle ?? "",
        s.subtitleUr ?? s.subtitle ?? "",
        language,
      ),
      imageUrl: s.imageUrl,
      videoUrl: s.videoUrl,
      posterUrl: s.posterUrl,
      linkUrl: s.linkUrl,
    })),
    videos: localizedVideos.map((v) => ({
      id: v.id,
      title: pickLocale(v.title, v.titleEn ?? v.title, v.titleUr ?? v.title, language),
      description: pickLocale(
        v.description ?? "",
        v.descriptionEn ?? v.description ?? "",
        v.descriptionUr ?? v.description ?? "",
        language,
      ),
      videoUrl: v.videoUrl,
      posterUrl: v.posterUrl,
    })),
    ads: localizedAds.map((a) => ({
      id: a.id,
      type: a.type ?? "image",
      title: pickLocale(a.title, a.titleEn ?? a.title, a.titleUr ?? a.title, language),
      subtitle: pickLocale(
        a.subtitle ?? "",
        a.subtitleEn ?? a.subtitle ?? "",
        a.subtitleUr ?? a.subtitle ?? "",
        language,
      ),
      body: pickLocale(
        a.body ?? "",
        a.bodyEn ?? a.body ?? "",
        a.bodyUr ?? a.body ?? "",
        language,
      ),
      imageUrl: a.imageUrl,
      videoUrl: a.videoUrl,
      posterUrl: a.posterUrl,
      linkUrl: a.linkUrl,
      animation: a.animation,
    })),
    zones: localizedZones.map((z) => ({
      id: z.id,
      type: z.type ?? "text",
      title: pickLocale(z.title, z.titleEn ?? z.title, z.titleUr ?? z.title, language),
      subtitle: pickLocale(
        z.subtitle ?? "",
        z.subtitleEn ?? z.subtitle ?? "",
        z.subtitleUr ?? z.subtitle ?? "",
        language,
      ),
      body: pickLocale(
        z.body ?? "",
        z.bodyEn ?? z.body ?? "",
        z.bodyUr ?? z.body ?? "",
        language,
      ),
      imageUrl: z.imageUrl,
      videoUrl: z.videoUrl,
      posterUrl: z.posterUrl,
      linkUrl: z.linkUrl,
      animation: z.animation,
    })),
  };
}
