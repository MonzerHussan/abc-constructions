-- AlterTable
ALTER TABLE "CarouselSlide" ALTER COLUMN "imageUrl" SET DEFAULT '';
ALTER TABLE "CarouselSlide" ADD COLUMN     "posterUrl" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'image',
ADD COLUMN     "videoUrl" TEXT;
