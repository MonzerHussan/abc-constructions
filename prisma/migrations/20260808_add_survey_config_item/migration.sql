-- CreateTable
CREATE TABLE "SurveyConfigItem" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "type" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyConfigItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SurveyConfigItem_parentId_idx" ON "SurveyConfigItem"("parentId");

-- CreateIndex
CREATE INDEX "SurveyConfigItem_type_idx" ON "SurveyConfigItem"("type");

-- CreateIndex
CREATE INDEX "SurveyConfigItem_isActive_idx" ON "SurveyConfigItem"("isActive");
