import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/platform-prisma", () => ({
  platformPrisma: {
    tenantMembership: {
      findFirst: vi.fn(),
    },
    tenantScopedSecret: {
      findFirst: vi.fn(),
    },
  },
}));

import { platformPrisma } from "@/lib/platform-prisma";
import { TenantService } from "@/modules/platform/services/TenantService";

describe("VS-0 tenant isolation", () => {
  const service = new TenantService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies access when user is not a member of tenant", async () => {
    vi.mocked(platformPrisma.tenantMembership.findFirst).mockResolvedValue(null);

    const result = await service.assertMembership("user-a", "tenant-b");
    expect(result).toBeNull();
  });

  it("allows access for active membership in active tenant", async () => {
    vi.mocked(platformPrisma.tenantMembership.findFirst).mockResolvedValue({
      id: "m1",
      tenantId: "tenant-a",
      userId: "user-a",
      roleKeys: ["owner"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      tenant: {
        id: "tenant-a",
        slug: "tenant-a",
        name: "Tenant A",
        status: "ACTIVE",
        legacyOrganizationId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as never);

    const result = await service.assertMembership("user-a", "tenant-a");
    expect(result?.tenantId).toBe("tenant-a");
  });

  it("scopes secret lookup to tenant — cross-tenant read returns null", async () => {
    vi.mocked(platformPrisma.tenantScopedSecret.findFirst).mockResolvedValue(null);

    const secret = await service.findScopedSecretById("secret-1", "tenant-b");
    expect(secret).toBeNull();
    expect(platformPrisma.tenantScopedSecret.findFirst).toHaveBeenCalledWith({
      where: { id: "secret-1", tenantId: "tenant-b" },
    });
  });
});
