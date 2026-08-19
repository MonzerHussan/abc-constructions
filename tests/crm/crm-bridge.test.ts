import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lead: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    userOrganization: {
      findFirst: vi.fn(),
    },
    organization: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/modules/shared/utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { prisma } from "@/lib/prisma";
import { CrmBridgeService } from "@/modules/crm/services/CrmBridgeService";

const mockEntity = {
  id: "e-internal",
  entityId: "ENTITY-00099",
  entityType: "SUPP",
  entitySubtype: "SUPPLIER",
  companyName: "ABC Contracting",
  contactPerson: "Ali Hassan",
  contactRole: null,
  contactEmail: "ali@example.com",
  contactPhone: "0555000000",
  languagePreference: "ARABIC",
  location: "Riyadh",
  industrySegment: null,
  relationshipStatus: "NEW",
  source: "INTERNAL",
  sourceDetail: "onboarding",
  pilotStatus: "STARTED",
  crmClassification: "SUPPLIER",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProfile = {
  id: "p1",
  profileId: "PROF-00099",
  entityId: "e-internal",
  userId: "user-1",
  businessActivity: "supplier",
  relevantCategories: ["construction-materials"],
  subcategories: ["portland-cement"],
  capabilities: ["Riyadh"],
  companySize: "large",
  annualVolume: null,
  hasCatalog: false,
  digitalMaturity: null,
  apiReadiness: null,
  surveyData: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("CrmBridgeService", () => {
  let service: CrmBridgeService;

  beforeEach(() => {
    service = new CrmBridgeService();
    vi.clearAllMocks();
    vi.mocked(prisma.lead.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userOrganization.findFirst).mockResolvedValue({
      id: "uo-1",
      userId: "user-1",
      organizationId: "org-1",
      roleId: null,
      title: null,
      isPrimary: true,
      isActive: true,
      joinedAt: new Date(),
    });
    vi.mocked(prisma.lead.create).mockResolvedValue({
      id: "lead-1",
      organizationId: "org-1",
      firstName: "Ali",
      lastName: "Hassan",
      email: "ali@example.com",
      phone: "0555000000",
      company: "ABC Contracting",
      jobTitle: null,
      source: "WEBSITE",
      status: "NEW",
      score: 72,
      tags: ["SUPPLIER", "SUPPLIER", "tier:B"],
      notes: "Entity Registry: ENTITY-00099",
      convertedToContactId: null,
      assignedToId: null,
      createdById: "user-1",
      registryEntityId: "ENTITY-00099",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("creates a CRM lead from Entity Registry onboarding data", async () => {
    const result = await service.syncLeadFromEntityRegistry({
      entity: mockEntity,
      profile: mockProfile,
      userId: "user-1",
      leadScore: 72,
      tier: "B",
    });

    expect(result.created).toBe(true);
    expect(result.leadId).toBe("lead-1");
    expect(prisma.lead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          registryEntityId: "ENTITY-00099",
          email: "ali@example.com",
          company: "ABC Contracting",
          createdById: "user-1",
          organizationId: "org-1",
          score: 72,
        }),
      }),
    );
  });

  it("is idempotent when lead already exists for registryEntityId", async () => {
    vi.mocked(prisma.lead.findUnique).mockResolvedValue({
      id: "lead-existing",
      organizationId: "org-1",
      firstName: "Ali",
      lastName: "Hassan",
      email: "ali@example.com",
      phone: null,
      company: "ABC",
      jobTitle: null,
      source: "WEBSITE",
      status: "NEW",
      score: 0,
      tags: [],
      notes: null,
      convertedToContactId: null,
      assignedToId: null,
      createdById: "user-1",
      registryEntityId: "ENTITY-00099",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.syncLeadFromEntityRegistry({
      entity: mockEntity,
      profile: mockProfile,
      userId: "user-1",
    });

    expect(result.created).toBe(false);
    expect(result.leadId).toBe("lead-existing");
    expect(prisma.lead.create).not.toHaveBeenCalled();
  });
});

describe("deriveLeadScoresFromSurvey", () => {
  it("maps survey answers to score dimensions", async () => {
    const { deriveLeadScoresFromSurvey } = await import("@/lib/onboarding/lead-scores");
    const scores = deriveLeadScoresFromSurvey({
      lookingFor: [],
      selectedCategories: ["construction-materials"],
      subcategories: ["portland-cement", "tiles", "aggregates"],
      hasProjects: "yes",
      budgetRange: "enterprise",
      projectLocations: ["Riyadh"],
      urgency: "immediate",
    });

    expect(scores.strategicScore).toBe(90);
    expect(scores.engagementScore).toBe(85);
    expect(scores.commercialScore).toBe(90);
    expect(scores.conversionScore).toBe(45);
  });
});
