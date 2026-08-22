/**
 * VS-0 platform permission keys (tenant-scoped RBAC).
 * Deny-default: missing permission → 403.
 */
export const PlatformPermissions = {
  TENANT_READ: "platform:tenant:read",
  SECRET_READ: "platform:secret:read",
  AUDIT_READ: "platform:audit:read",
  OUTBOX_RELAY: "platform:outbox:relay",
} as const;

export type PlatformPermission =
  (typeof PlatformPermissions)[keyof typeof PlatformPermissions];

/** Platform role bundles — mapped to TenantMembership.roleKeys */
export const PlatformRoles = {
  ADMIN: "platform:admin",
  MEMBER: "platform:member",
  VIEWER: "platform:viewer",
} as const;

const ROLE_PERMISSION_MAP: Record<string, readonly PlatformPermission[]> = {
  [PlatformRoles.ADMIN]: [
    PlatformPermissions.TENANT_READ,
    PlatformPermissions.SECRET_READ,
    PlatformPermissions.AUDIT_READ,
    PlatformPermissions.OUTBOX_RELAY,
  ],
  [PlatformRoles.MEMBER]: [
    PlatformPermissions.TENANT_READ,
    PlatformPermissions.SECRET_READ,
  ],
  [PlatformRoles.VIEWER]: [PlatformPermissions.TENANT_READ],
};

export function resolvePlatformPermissions(
  roleKeys: string[]
): Set<PlatformPermission> {
  const permissions = new Set<PlatformPermission>();
  for (const role of roleKeys) {
    const mapped = ROLE_PERMISSION_MAP[role];
    if (mapped) {
      for (const p of mapped) permissions.add(p);
    }
  }
  return permissions;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Deny-default authorization for platform tenant scope.
 */
export function authorizePlatformPermission(
  roleKeys: string[],
  permission: PlatformPermission
): AuthorizationResult {
  if (!permission) {
    return { allowed: false, reason: "Permission key required" };
  }
  const granted = resolvePlatformPermissions(roleKeys);
  if (!granted.has(permission)) {
    return { allowed: false, reason: `Missing permission: ${permission}` };
  }
  return { allowed: true };
}

/**
 * Tenant row scope — every platform query must include tenantId filter.
 */
export function tenantScopeFilter(tenantId: string) {
  return { tenantId };
}

export function assertTenantScope(
  resourceTenantId: string,
  activeTenantId: string
): void {
  if (resourceTenantId !== activeTenantId) {
    throw new TenantScopeViolationError(resourceTenantId, activeTenantId);
  }
}

export class TenantScopeViolationError extends Error {
  constructor(
    public readonly resourceTenantId: string,
    public readonly activeTenantId: string
  ) {
    super(
      `Tenant scope violation: resource=${resourceTenantId} active=${activeTenantId}`
    );
    this.name = "TenantScopeViolationError";
  }
}
