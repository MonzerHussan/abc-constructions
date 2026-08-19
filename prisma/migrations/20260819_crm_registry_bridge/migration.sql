-- AlterTable: link CRM leads to Entity Registry onboarding records
ALTER TABLE "Lead" ADD COLUMN "registryEntityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_registryEntityId_key" ON "Lead"("registryEntityId");
