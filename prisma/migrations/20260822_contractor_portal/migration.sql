-- Contractor Portal (Phase 1): persona + capability registry per organization

CREATE TYPE "PortalCapability" AS ENUM (
  'PROCUREMENT',
  'TENDERING',
  'MARKETPLACE',
  'PROJECTS',
  'WORKFORCE',
  'TRAINING',
  'SERVICES',
  'COMPLIANCE'
);

CREATE TABLE "OrganizationPersona" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "persona" "PlatformAccountType" NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrganizationPersona_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrganizationCapability" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "capability" "PortalCapability" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "source" TEXT NOT NULL,
  CONSTRAINT "OrganizationCapability_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrganizationPersona_organizationId_persona_key" ON "OrganizationPersona"("organizationId", "persona");
CREATE INDEX "OrganizationPersona_organizationId_idx" ON "OrganizationPersona"("organizationId");

CREATE UNIQUE INDEX "OrganizationCapability_organizationId_capability_key" ON "OrganizationCapability"("organizationId", "capability");
CREATE INDEX "OrganizationCapability_organizationId_idx" ON "OrganizationCapability"("organizationId");

ALTER TABLE "OrganizationPersona" ADD CONSTRAINT "OrganizationPersona_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationCapability" ADD CONSTRAINT "OrganizationCapability_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;