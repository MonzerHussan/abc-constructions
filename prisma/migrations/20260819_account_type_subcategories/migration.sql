-- Platform account types enum + subcategories table + extend UserRole
CREATE TYPE "PlatformAccountType" AS ENUM (
  'OWNER',
  'CONSULTANT',
  'CONTRACTOR',
  'SUBCONTRACTOR',
  'SUPPLIER',
  'TRADER',
  'INDIVIDUAL',
  'COMPANY',
  'ENTITY'
);

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'INDIVIDUAL';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'COMPANY';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ENTITY';

CREATE TABLE "AccountTypeSubcategory" (
  "id" TEXT NOT NULL,
  "accountType" "PlatformAccountType" NOT NULL,
  "labelEn" TEXT NOT NULL,
  "labelAr" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AccountTypeSubcategory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AccountTypeSubcategory_accountType_idx" ON "AccountTypeSubcategory"("accountType");
CREATE INDEX "AccountTypeSubcategory_accountType_isActive_idx" ON "AccountTypeSubcategory"("accountType", "isActive");
