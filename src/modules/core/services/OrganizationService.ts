import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import type { OrganizationType } from '@/generated/prisma/client';
import type { CreateOrgInput } from '@/modules/core/validators/org-schemas';

export class OrganizationService {
  async findById(id: string) {
    return prisma.organization.findUnique({ where: { id }, include: { users: true, roles: true } });
  }

  async create(input: CreateOrgInput, ownerId: string) {
    const org = await prisma.organization.create({
      data: {
        name: input.name,
        nameAr: input.nameAr,
        type: input.type,
        website: input.website,
        about: input.about,
      },
    });
    await this.addUserToOrg(ownerId, org.id, undefined, true);
    await eventBus.publish({
      name: buildEventName('Core', 'Organization', 'Created'),
      version: 1,
      payload: { orgId: org.id, name: org.name, ownerId },
      metadata: {
        timestamp: new Date(),
        correlationId: `corr_${org.id}_${Date.now()}`,
        source: 'core',
      },
    });
    logger.info(`Organization created: ${org.name}`, { orgId: org.id, ownerId });
    return org;
  }

  async addUserToOrg(userId: string, orgId: string, roleId?: string, isPrimary = false) {
    return prisma.userOrganization.create({
      data: { userId, organizationId: orgId, roleId, isPrimary },
    });
  }

  async getUsers(orgId: string) {
    return prisma.userOrganization.findMany({
      where: { organizationId: orgId, isActive: true },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
        role: true,
      },
    });
  }

  async updateUserRole(userId: string, orgId: string, roleId: string) {
    return prisma.userOrganization.update({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      data: { roleId },
    });
  }

  async removeUser(userId: string, orgId: string) {
    return prisma.userOrganization.update({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      data: { isActive: false },
    });
  }

  async verifyOrg(orgId: string) {
    return prisma.organization.update({
      where: { id: orgId },
      data: { isVerified: true, verificationLevel: 1 },
    });
  }

  /** Primary (or first active) organization for a user — Core SoR for org membership. */
  async findPrimaryOrganizationId(userId: string): Promise<string | null> {
    const membership = await prisma.userOrganization.findFirst({
      where: { userId, isActive: true },
      orderBy: [{ isPrimary: 'desc' }, { joinedAt: 'asc' }],
      select: { organizationId: true },
    });
    return membership?.organizationId ?? null;
  }

  async findActiveByName(name: string): Promise<{ id: string } | null> {
    return prisma.organization.findFirst({
      where: { name, isActive: true },
      select: { id: true },
    });
  }

  /** System/bootstrap org without owner membership (integration bridges only). */
  async createBootstrapOrganization(input: {
    name: string;
    nameAr?: string;
    type: OrganizationType;
  }): Promise<{ id: string }> {
    return prisma.organization.create({
      data: {
        name: input.name,
        nameAr: input.nameAr,
        type: input.type,
      },
      select: { id: true },
    });
  }
}
