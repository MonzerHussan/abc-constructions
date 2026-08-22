-- VS-0 Platform schema migration
-- Domain-owned: platform (Phase 3 Wave 0)

CREATE SCHEMA IF NOT EXISTS "platform";

CREATE TYPE "platform"."TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PROVISIONING');
CREATE TYPE "platform"."OutboxStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED');

CREATE TABLE "platform"."tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "platform"."TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "legacyOrganizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_slug_key" ON "platform"."tenant"("slug");
CREATE UNIQUE INDEX "tenant_legacyOrganizationId_key" ON "platform"."tenant"("legacyOrganizationId");

CREATE TABLE "platform"."tenant_membership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_membership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_membership_tenantId_userId_key" ON "platform"."tenant_membership"("tenantId", "userId");
CREATE INDEX "tenant_membership_userId_idx" ON "platform"."tenant_membership"("userId");

ALTER TABLE "platform"."tenant_membership"
    ADD CONSTRAINT "tenant_membership_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "platform"."tenant"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "platform"."tenant_scoped_secret" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_scoped_secret_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tenant_scoped_secret_tenantId_idx" ON "platform"."tenant_scoped_secret"("tenantId");

ALTER TABLE "platform"."tenant_scoped_secret"
    ADD CONSTRAINT "tenant_scoped_secret_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "platform"."tenant"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "platform"."outbox_event" (
    "id" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "correlationId" TEXT NOT NULL,
    "causationId" TEXT,
    "tenantId" TEXT,
    "status" "platform"."OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "outbox_event_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "outbox_event_status_createdAt_idx" ON "platform"."outbox_event"("status", "createdAt");
CREATE INDEX "outbox_event_correlationId_idx" ON "platform"."outbox_event"("correlationId");

CREATE TABLE "platform"."processed_event" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "processed_event_consumerId_eventId_key" ON "platform"."processed_event"("consumerId", "eventId");

CREATE TABLE "platform"."audit_entry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "correlationId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_entry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_entry_tenantId_createdAt_idx" ON "platform"."audit_entry"("tenantId", "createdAt");
CREATE INDEX "audit_entry_actorUserId_idx" ON "platform"."audit_entry"("actorUserId");

ALTER TABLE "platform"."audit_entry"
    ADD CONSTRAINT "audit_entry_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "platform"."tenant"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "platform"."idempotency_record" (
    "idempotencyKey" TEXT NOT NULL,
    "tenantId" TEXT,
    "responseHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_record_pkey" PRIMARY KEY ("idempotencyKey")
);

CREATE INDEX "idempotency_record_expiresAt_idx" ON "platform"."idempotency_record"("expiresAt");
