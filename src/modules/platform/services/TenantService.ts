import { platformPrisma } from "@/lib/platform-prisma";
import type { Prisma } from "@/generated/platform-prisma/client";
import { TenantStatus } from "@/generated/platform-prisma/client";

export interface CreateTenantInput {
  slug: string;
  name: string;
  legacyOrganizationId?: string;
}

export interface AddMembershipInput {
  tenantId: string;
  userId: string;
  roleKeys?: string[];
}

export class TenantService {
  async createTenant(input: CreateTenantInput) {
    return platformPrisma.tenant.create({
      data: {
        slug: input.slug,
        name: input.name,
        legacyOrganizationId: input.legacyOrganizationId,
        status: TenantStatus.ACTIVE,
      },
    });
  }

  async findById(tenantId: string) {
    return platformPrisma.tenant.findUnique({ where: { id: tenantId } });
  }

  async findBySlug(slug: string) {
    return platformPrisma.tenant.findUnique({ where: { slug } });
  }

  async addMembership(input: AddMembershipInput) {
    return platformPrisma.tenantMembership.upsert({
      where: {
        tenantId_userId: {
          tenantId: input.tenantId,
          userId: input.userId,
        },
      },
      create: {
        tenantId: input.tenantId,
        userId: input.userId,
        roleKeys: input.roleKeys ?? [],
        isActive: true,
      },
      update: {
        roleKeys: input.roleKeys ?? [],
        isActive: true,
      },
    });
  }

  async assertMembership(userId: string, tenantId: string) {
    const membership = await platformPrisma.tenantMembership.findFirst({
      where: { userId, tenantId, isActive: true },
      include: { tenant: true },
    });

    if (!membership || membership.tenant.status !== TenantStatus.ACTIVE) {
      return null;
    }

    return membership;
  }

  async listMembershipsForUser(userId: string) {
    return platformPrisma.tenantMembership.findMany({
      where: { userId, isActive: true },
      include: { tenant: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async createScopedSecret(tenantId: string, label: string, secret: string) {
    return platformPrisma.tenantScopedSecret.create({
      data: { tenantId, label, secret },
    });
  }

  async listScopedSecretsForTenant(tenantId: string) {
    return platformPrisma.tenantScopedSecret.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findScopedSecretById(id: string, tenantId: string) {
    return platformPrisma.tenantScopedSecret.findFirst({
      where: { id, tenantId },
    });
  }

  async runInTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return platformPrisma.$transaction(fn);
  }
}

export const tenantService = new TenantService();
