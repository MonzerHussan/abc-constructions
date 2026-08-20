-- AlterTable
ALTER TABLE "Ad" ALTER COLUMN "imageUrl" SET DEFAULT '';
ALTER TABLE "Ad" ADD COLUMN     "body" TEXT,
ADD COLUMN     "bodyEn" TEXT,
ADD COLUMN     "bodyUr" TEXT,
ADD COLUMN     "posterUrl" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'image',
ADD COLUMN     "videoUrl" TEXT;
