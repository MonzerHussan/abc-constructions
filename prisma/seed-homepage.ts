import { prisma } from "../src/lib/prisma";
import { HOMEPAGE_DEFAULTS } from "../src/lib/homepage-defaults";

async function main() {
  const d = HOMEPAGE_DEFAULTS;

  const existing = await prisma.homepageContent.findFirst();
  if (!existing) {
    await prisma.homepageContent.create({
      data: {
        introTitle: d.content.introTitle,
        introTitleEn: d.content.introTitleEn,
        introTitleUr: d.content.introTitleUr,
        introBody: d.content.introBody,
        introBodyEn: d.content.introBodyEn,
        introBodyUr: d.content.introBodyUr,
        visionTitle: d.content.visionTitle,
        visionTitleEn: d.content.visionTitleEn,
        visionTitleUr: d.content.visionTitleUr,
        visionBody: d.content.visionBody,
        visionBodyEn: d.content.visionBodyEn,
        visionBodyUr: d.content.visionBodyUr,
        primaryCtaLabel: d.content.primaryCtaLabel,
        primaryCtaLabelEn: d.content.primaryCtaLabelEn,
        primaryCtaLabelUr: d.content.primaryCtaLabelUr,
        primaryCtaHref: d.content.primaryCtaHref,
        secondaryCtaLabel: d.content.secondaryCtaLabel,
        secondaryCtaLabelEn: d.content.secondaryCtaLabelEn,
        secondaryCtaLabelUr: d.content.secondaryCtaLabelUr,
        secondaryCtaHref: d.content.secondaryCtaHref,
      },
    });
    console.log("seeded HomepageContent");
  }

  const slideCount = await prisma.carouselSlide.count();
  if (slideCount === 0) {
    for (const s of d.slides) {
      await prisma.carouselSlide.create({
        data: {
          type: s.type ?? "image",
          title: s.title,
          titleEn: s.titleEn,
          titleUr: s.titleUr,
          subtitle: s.subtitle,
          subtitleEn: s.subtitleEn,
          subtitleUr: s.subtitleUr,
          imageUrl: s.imageUrl,
          videoUrl: s.videoUrl,
          posterUrl: s.posterUrl,
          linkUrl: s.linkUrl,
          sortOrder: s.sortOrder,
        },
      });
    }
    console.log(`seeded ${d.slides.length} CarouselSlides`);
  }

  const videoCount = await prisma.videoSection.count();
  if (videoCount === 0) {
    for (const v of d.videos) {
      await prisma.videoSection.create({
        data: {
          title: v.title,
          titleEn: v.titleEn,
          titleUr: v.titleUr,
          description: v.description,
          descriptionEn: v.descriptionEn,
          descriptionUr: v.descriptionUr,
          videoUrl: v.videoUrl,
          posterUrl: v.posterUrl,
          sortOrder: v.sortOrder,
        },
      });
    }
    console.log(`seeded ${d.videos.length} VideoSections`);
  }

  const adCount = await prisma.ad.count();
  if (adCount === 0) {
    for (const a of d.ads) {
      await prisma.ad.create({
        data: {
          type: a.type ?? "image",
          title: a.title,
          titleEn: a.titleEn,
          titleUr: a.titleUr,
          subtitle: a.subtitle,
          subtitleEn: a.subtitleEn,
          subtitleUr: a.subtitleUr,
          body: a.body,
          bodyEn: a.bodyEn,
          bodyUr: a.bodyUr,
          imageUrl: a.imageUrl,
          videoUrl: a.videoUrl,
          posterUrl: a.posterUrl,
          linkUrl: a.linkUrl,
          animation: a.animation,
          sortOrder: a.sortOrder,
        },
      });
    }
    console.log(`seeded ${d.ads.length} Ads`);
  }

  console.log("homepage seed done");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
