-- AlterTable
ALTER TABLE "HomepageContent" ADD COLUMN     "leftBlockBody" TEXT,
ADD COLUMN     "leftBlockBodyEn" TEXT,
ADD COLUMN     "leftBlockBodyUr" TEXT,
ADD COLUMN     "leftBlockEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "leftBlockImageUrl" TEXT,
ADD COLUMN     "leftBlockLinkUrl" TEXT,
ADD COLUMN     "leftBlockPosterUrl" TEXT,
ADD COLUMN     "leftBlockTitle" TEXT,
ADD COLUMN     "leftBlockTitleEn" TEXT,
ADD COLUMN     "leftBlockTitleUr" TEXT,
ADD COLUMN     "leftBlockType" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN     "leftBlockVideoUrl" TEXT;