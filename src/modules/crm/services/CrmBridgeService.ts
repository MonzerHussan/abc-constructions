import { prisma } from "@/lib/prisma";
import { orgService } from "@/modules/core";
import { logger } from "@/modules/shared/utils/logger";
import { OrganizationType } from "@/generated/prisma/client";
import type { Entity, Profile } from "@/generated/prisma/client";
import { LeadSource } from "@/generated/prisma/client";

const PLATFORM_ORG_NAME = "ABC Platform";

function splitContactName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const trimmed = (fullName ?? "").trim();
  if (!trimmed) return { firstName: "Unknown", lastName: "-" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function mapEntitySourceToLeadSource(
  source: string,
  sourceDetail?: string | null
): LeadSource {
  if (sourceDetail === "onboarding") return LeadSource.WEBSITE;
  if (source === "INTERNAL") return LeadSource.MARKETPLACE;
  return LeadSource.OTHER;
}

function buildLeadNotes(entity: Entity, profile: Profile | null): string {
  const lines = [
    `Entity Registry: ${entity.entityId}`,
    `Classification: ${entity.crmClassification}`,
    `Subtype: ${entity.entitySubtype}`,
  ];
  if (profile?.businessActivity) lines.push(`Account type: ${profile.businessActivity}`);
  if (profile?.relevantCategories?.length) {
    lines.push(`Categories: ${profile.relevantCategories.join(", ")}`);
  }
  if (profile?.subcategories?.length) {
    lines.push(`Subcategories: ${profile.subcategories.slice(0, 8).join(", ")}${profile.subcategories.length > 8 ? "…" : ""}`);
  }
  return lines.join("\n");
}

export class CrmBridgeService {
  async resolveOrganizationId(userId: string | null | undefined): Promise<string> {
    if (userId) {
      const orgId = await orgService.findPrimaryOrganizationId(userId);
      if (orgId) return orgId;
    }

    const existing = await orgService.findActiveByName(PLATFORM_ORG_NAME);
    if (existing) return existing.id;

    const created = await orgService.createBootstrapOrganization({
      name: PLATFORM_ORG_NAME,
      nameAr: "منصة ABC",
      type: OrganizationType.PLATFORM_ADMIN,
    });
    logger.info("Created platform organization for CRM bridge", { orgId: created.id });
    return created.id;
  }

  async syncLeadFromEntityRegistry(input: {
    entity: Entity;
    profile: Profile | null;
    userId: string | null | undefined;
    leadScore?: number;
    tier?: string;
  }): Promise<{ leadId: string; created: boolean }> {
    const { entity, profile, userId, leadScore = 0, tier } = input;

    const existing = await prisma.lead.findUnique({
      where: { registryEntityId: entity.entityId },
      select: { id: true },
    });
    if (existing) {
      return { leadId: existing.id, created: false };
    }

    if (!userId) {
      throw new Error("CRM bridge requires a userId for createdById");
    }

    const organizationId = await this.resolveOrganizationId(userId);
    const { firstName, lastName } = splitContactName(entity.contactPerson);
    const tags = [
      entity.crmClassification,
      entity.entitySubtype,
      tier ? `tier:${tier}` : null,
    ].filter(Boolean) as string[];

    const lead = await prisma.lead.create({
      data: {
        organizationId,
        firstName,
        lastName,
        email: entity.contactEmail,
        phone: entity.contactPhone,
        company: entity.companyName,
        jobTitle: entity.contactRole,
        source: mapEntitySourceToLeadSource(entity.source, entity.sourceDetail),
        status: "NEW",
        score: Math.round(leadScore),
        tags,
        notes: buildLeadNotes(entity, profile),
        registryEntityId: entity.entityId,
        createdById: userId,
      },
      select: { id: true },
    });

    logger.info("CRM lead created from Entity Registry", {
      leadId: lead.id,
      registryEntityId: entity.entityId,
    });

    return { leadId: lead.id, created: true };
  }
}

export const crmBridgeService = new CrmBridgeService();
