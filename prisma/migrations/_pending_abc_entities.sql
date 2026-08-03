-- CreateEnum
CREATE TYPE "WorkflowHistoryResult" AS ENUM ('SUCCESS', 'BLOCKED_BY_GUARD', 'INVALID_TRANSITION', 'ERROR');

-- AlterTable
ALTER TABLE "SupplierProfile" ADD COLUMN     "entityId" TEXT;

-- CreateTable
CREATE TABLE "WorkflowHistory" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT,
    "result" "WorkflowHistoryResult" NOT NULL DEFAULT 'SUCCESS',
    "guardName" TEXT,
    "reason" TEXT,
    "actorId" TEXT,
    "actorRole" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkflowHistory_entityType_entityId_idx" ON "WorkflowHistory"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "WorkflowHistory_entityType_entityId_createdAt_idx" ON "WorkflowHistory"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowHistory_actorId_idx" ON "WorkflowHistory"("actorId");

-- CreateIndex
CREATE INDEX "WorkflowHistory_result_idx" ON "WorkflowHistory"("result");

-- CreateIndex
CREATE INDEX "WorkflowHistory_createdAt_idx" ON "WorkflowHistory"("createdAt");


