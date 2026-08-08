-- CreateEnum
CREATE TYPE "OnboardingAnswerType" AS ENUM ('TEXT', 'TEXTAREA', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN', 'RATING', 'LINEAR_SCALE', 'YES_NO', 'EMAIL', 'PHONE', 'DATE');

-- CreateTable
CREATE TABLE "OnboardingQuestion" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "answerType" "OnboardingAnswerType" NOT NULL,
    "options" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OnboardingQuestion_category_idx" ON "OnboardingQuestion"("category");

-- CreateIndex
CREATE INDEX "OnboardingQuestion_category_isActive_idx" ON "OnboardingQuestion"("category", "isActive");

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "surveyData" JSONB;
