-- CreateTable
CREATE TABLE "HomepageZone" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleUr" TEXT,
    "subtitle" TEXT,
    "subtitleEn" TEXT,
    "subtitleUr" TEXT,
    "body" TEXT,
    "bodyEn" TEXT,
    "bodyUr" TEXT,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "videoUrl" TEXT,
    "posterUrl" TEXT,
    "linkUrl" TEXT,
    "animation" TEXT NOT NULL DEFAULT 'fade',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageZone_pkey" PRIMARY KEY ("id")
);
