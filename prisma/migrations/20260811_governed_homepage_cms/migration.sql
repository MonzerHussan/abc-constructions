-- Governed Homepage CMS: admin-controlled dynamic layout
CREATE TABLE "HomepageConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "logoUrl" TEXT,
    "ctaLabel" JSONB,
    "ctaHref" TEXT,
    "heroTitle" JSONB,
    "heroSubtitle" JSONB,
    "heroDescription" JSONB,
    "footerText" JSONB,
    "showLanguage" BOOLEAN NOT NULL DEFAULT true,
    "showLogin" BOOLEAN NOT NULL DEFAULT true,
    "showRegister" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HomepageConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HomepageZone" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'TEXT',
    "title" JSONB,
    "body" JSONB,
    "mediaUrl" TEXT,
    "link" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HomepageZone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HomepageSlide" (
    "id" TEXT NOT NULL,
    "title" JSONB,
    "subtitle" JSONB,
    "imageUrl" TEXT NOT NULL,
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "HomepageSlide_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HeaderMenu" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "HeaderMenu_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HeaderMenuItem" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "label" JSONB,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "HeaderMenuItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FooterLink" (
    "id" TEXT NOT NULL,
    "label" JSONB,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HomepageAd" (
    "id" TEXT NOT NULL,
    "title" JSONB,
    "imageUrl" TEXT,
    "link" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HomepageAd_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HomepageConfig_key_key" ON "HomepageConfig"("key");
CREATE UNIQUE INDEX "HeaderMenu_key_key" ON "HeaderMenu"("key");
CREATE INDEX "HeaderMenuItem_menuId_idx" ON "HeaderMenuItem"("menuId");

ALTER TABLE "HeaderMenuItem" ADD CONSTRAINT "HeaderMenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "HeaderMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;