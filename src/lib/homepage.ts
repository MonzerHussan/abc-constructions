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
  };
  slides: Array<{
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
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
  const [contentRow, slides, videos, ads] = await Promise.all([
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
  };

  const localizedSlides = slides.length > 0 ? slides : d.slides;
  const localizedVideos = videos.length > 0 ? videos : d.videos;
  const localizedAds = ads.length > 0 ? ads : d.ads;

  return {
    content: localizedContent,
    slides: localizedSlides.map((s) => ({
      id: s.id,
      title: pickLocale(s.title, s.titleEn ?? s.title, s.titleUr ?? s.title, language),
      subtitle: pickLocale(
        s.subtitle ?? "",
        s.subtitleEn ?? s.subtitle ?? "",
        s.subtitleUr ?? s.subtitle ?? "",
        language,
      ),
      imageUrl: s.imageUrl,
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
      type: "type" in a && a.type ? String(a.type) : "image",
      title: pickLocale(a.title, a.titleEn ?? a.title, a.titleUr ?? a.title, language),
      subtitle: pickLocale(
        a.subtitle ?? "",
        a.subtitleEn ?? a.subtitle ?? "",
        a.subtitleUr ?? a.subtitle ?? "",
        language,
      ),
      body:
        "body" in a && a.body
          ? pickLocale(
              String(a.body),
              ("bodyEn" in a ? a.bodyEn : null) ?? String(a.body),
              ("bodyUr" in a ? a.bodyUr : null) ?? String(a.body),
              language,
            )
          : "",
      imageUrl: a.imageUrl,
      videoUrl: "videoUrl" in a ? (a.videoUrl as string | null) : null,
      posterUrl: "posterUrl" in a ? (a.posterUrl as string | null) : null,
      linkUrl: a.linkUrl,
      animation: a.animation,
    })),
    zones: d.zones.map((z) => ({
      id: z.id,
      type: z.type,
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
