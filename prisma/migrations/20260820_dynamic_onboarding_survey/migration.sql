-- Dynamic onboarding survey templates (Admin-controlled)

CREATE TABLE "OnboardingSurveyTemplate" (
    "id" TEXT NOT NULL,
    "accountType" "PlatformAccountType" NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingSurveyTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OnboardingSurveySection" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleUr" TEXT,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "descriptionUr" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showIf" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingSurveySection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OnboardingSurveyQuestion" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "questionTextEn" TEXT NOT NULL,
    "questionTextAr" TEXT NOT NULL,
    "questionTextUr" TEXT,
    "answerType" "OnboardingAnswerType" NOT NULL,
    "options" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "showIf" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingSurveyQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OnboardingSectionContent" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleAr" TEXT,
    "titleUr" TEXT,
    "bodyEn" TEXT,
    "bodyAr" TEXT,
    "bodyUr" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "posterUrl" TEXT,
    "linkUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingSectionContent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OnboardingSurveyProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountType" "PlatformAccountType" NOT NULL,
    "currentSectionCode" TEXT,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "skippedSections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completedSections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingSurveyProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OnboardingSurveyTemplate_accountType_key" ON "OnboardingSurveyTemplate"("accountType");
CREATE UNIQUE INDEX "OnboardingSurveySection_templateId_code_key" ON "OnboardingSurveySection"("templateId", "code");
CREATE INDEX "OnboardingSurveySection_templateId_idx" ON "OnboardingSurveySection"("templateId");
CREATE UNIQUE INDEX "OnboardingSurveyQuestion_sectionId_code_key" ON "OnboardingSurveyQuestion"("sectionId", "code");
CREATE INDEX "OnboardingSurveyQuestion_sectionId_idx" ON "OnboardingSurveyQuestion"("sectionId");
CREATE UNIQUE INDEX "OnboardingSectionContent_sectionId_key" ON "OnboardingSectionContent"("sectionId");
CREATE UNIQUE INDEX "OnboardingSurveyProgress_userId_key" ON "OnboardingSurveyProgress"("userId");
CREATE INDEX "OnboardingSurveyProgress_accountType_idx" ON "OnboardingSurveyProgress"("accountType");

ALTER TABLE "OnboardingSurveySection" ADD CONSTRAINT "OnboardingSurveySection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "OnboardingSurveyTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OnboardingSurveyQuestion" ADD CONSTRAINT "OnboardingSurveyQuestion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "OnboardingSurveySection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OnboardingSectionContent" ADD CONSTRAINT "OnboardingSectionContent_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "OnboardingSurveySection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OnboardingSurveyProgress" ADD CONSTRAINT "OnboardingSurveyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
