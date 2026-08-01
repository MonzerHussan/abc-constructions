import { prisma } from '@/lib/prisma';

export class RBACService {
  async getPermissions(roleId: string) {
    return prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
  }

  async assignPermission(roleId: string, permissionId: string) {
    return prisma.rolePermission.create({
      data: { roleId, permissionId },
    });
  }

  async removePermission(roleId: string, permissionId: string) {
    return prisma.rolePermission.deleteMany({
      where: { roleId, permissionId },
    });
  }

  async syncRolePermissions(roleId: string, permissionIds: string[]) {
    await prisma.rolePermission.deleteMany({ where: { roleId } });
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      });
    }
  }

  async createRole(data: {
    name: string;
    nameAr?: string;
    description?: string;
    organizationType: string;
    organizationId?: string;
  }) {
    return prisma.role.create({ data: data as any });
  }

  async findRolesByOrgType(orgType: string) {
    return prisma.role.findMany({
      where: { organizationType: orgType as any, isActive: true },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async getUserEffectivePermissions(userId: string, orgId: string) {
    const membership = await prisma.userOrganization.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });
    if (!membership?.role) return [];
    return membership.role.permissions.map((rp) => rp.permission.key);
  }

  async hasPermission(userId: string, permissionKey: string, orgId: string) {
    const perms = await this.getUserEffectivePermissions(userId, orgId);
    return perms.includes(permissionKey);
  }
}
