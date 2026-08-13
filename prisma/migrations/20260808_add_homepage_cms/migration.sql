-- CreateTable
CREATE TABLE "HomepageContent" (
    "id" TEXT NOT NULL,
    "introTitle" TEXT NOT NULL,
    "introTitleEn" TEXT,
    "introTitleUr" TEXT,
    "introBody" TEXT NOT NULL,
    "introBodyEn" TEXT,
    "introBodyUr" TEXT,
    "visionTitle" TEXT NOT NULL,
    "visionTitleEn" TEXT,
    "visionTitleUr" TEXT,
    "visionBody" TEXT NOT NULL,
    "visionBodyEn" TEXT,
    "visionBodyUr" TEXT,
    "primaryCtaLabel" TEXT NOT NULL DEFAULT 'ابدأ الآن مجاناً',
    "primaryCtaLabelEn" TEXT DEFAULT 'Start Free Now',
    "primaryCtaLabelUr" TEXT,
    "primaryCtaHref" TEXT NOT NULL DEFAULT '/auth/register',
    "secondaryCtaLabel" TEXT NOT NULL DEFAULT 'تصفح المناقصات',
    "secondaryCtaLabelEn" TEXT DEFAULT 'Browse Bids',
    "secondaryCtaLabelUr" TEXT,
    "secondaryCtaHref" TEXT NOT NULL DEFAULT '/tenders/projects',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarouselSlide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleUr" TEXT,
    "subtitle" TEXT,
    "subtitleEn" TEXT,
    "subtitleUr" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarouselSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleUr" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "descriptionUr" TEXT,
    "videoUrl" TEXT NOT NULL,
    "posterUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleUr" TEXT,
    "subtitle" TEXT,
    "subtitleEn" TEXT,
    "subtitleUr" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "animation" TEXT NOT NULL DEFAULT 'fade',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);
