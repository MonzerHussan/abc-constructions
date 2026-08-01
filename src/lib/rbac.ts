import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getUserPermissions(userId: string, organizationId?: string): Promise<string[]> {
  const membershipWhere: any = { userId, isActive: true }
  if (organizationId) membershipWhere.organizationId = organizationId

  const memberships = await prisma.userOrganization.findMany({
    where: membershipWhere,
    include: {
      role: {
        include: { permissions: { include: { permission: true } } },
      },
    },
  })

  const permissions = new Set<string>()
  for (const m of memberships) {
    if (m.role) {
      for (const rp of m.role.permissions) {
        permissions.add(rp.permission.key)
      }
    }
  }

  return Array.from(permissions)
}

export async function hasPermission(userId: string, permissionKey: string, organizationId?: string): Promise<boolean> {
  return getUserPermissions(userId, organizationId).then((perms) => perms.includes(permissionKey))
}

export async function hasAnyPermission(userId: string, permissionKeys: string[], organizationId?: string): Promise<boolean> {
  const perms = await getUserPermissions(userId, organizationId)
  return permissionKeys.some((k) => perms.includes(k))
}

export async function requirePermission(permissionKey: string, organizationId?: string) {
  const session = await auth()
  if (!session?.user?.id) return { allowed: false, error: "Unauthorized", status: 401 }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") return { allowed: true, error: null, status: 200 }

  const allowed = await hasPermission(session.user.id, permissionKey, organizationId)
  if (!allowed) return { allowed: false, error: "Forbidden", status: 403 }

  return { allowed: true, error: null, status: 200, userId: session.user.id }
}

export async function getUserOrganizations(userId: string) {
  return prisma.userOrganization.findMany({
    where: { userId, isActive: true },
    include: {
      organization: { select: { id: true, name: true, nameAr: true, type: true, logo: true } },
      role: { select: { id: true, name: true, nameAr: true } },
    },
  })
}

export async function getEffectiveOrgId(userId: string): Promise<string | null> {
  const membership = await prisma.userOrganization.findFirst({
    where: { userId, isActive: true, isPrimary: true },
    select: { organizationId: true },
  })
  return membership?.organizationId || null
}
