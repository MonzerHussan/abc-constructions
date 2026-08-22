-- AlterTable User: registration + OAuth fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roleConfirmed" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyType" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "city" TEXT;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address" TEXT;

-- CreateTable HomepageZone (if missing)
CREATE TABLE IF NOT EXISTS "HomepageZone" (
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

-- CreateTable OnboardingSideContent
CREATE TABLE IF NOT EXISTS "OnboardingSideContent" (
    "id" TEXT NOT NULL,
    "accountType" "PlatformAccountType" NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'mixed',
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
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OnboardingSideContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "OnboardingSideContent_accountType_key" ON "OnboardingSideContent"("accountType");

ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "registryEntityId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Lead_registryEntityId_key" ON "Lead"("registryEntityId");
