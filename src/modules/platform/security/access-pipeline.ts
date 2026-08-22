import type { PlatformPermission } from "@/modules/platform/security/platform-authorization";
import {
  authorizePlatformPermission,
  assertTenantScope,
} from "@/modules/platform/security/platform-authorization";
import { assertSodAllowed } from "@/modules/platform/security/sod-policy";

export interface PlatformAccessContext {
  userId: string;
  tenantId: string;
  roleKeys: string[];
}

/**
 * Full VS-0 authorization pipeline: tenant scope + RBAC deny-default + SoD.
 */
export function enforcePlatformAccess(
  ctx: PlatformAccessContext,
  permission: PlatformPermission,
  resourceTenantId?: string
): { allowed: true } | { allowed: false; reason: string } {
  if (resourceTenantId) {
    try {
      assertTenantScope(resourceTenantId, ctx.tenantId);
    } catch {
      return { allowed: false, reason: "Tenant scope violation" };
    }
  }

  const authz = authorizePlatformPermission(ctx.roleKeys, permission);
  if (!authz.allowed) {
    return { allowed: false, reason: authz.reason ?? "Forbidden" };
  }

  try {
    assertSodAllowed(ctx.roleKeys, permission);
  } catch (err) {
    const message = err instanceof Error ? err.message : "SoD violation";
    return { allowed: false, reason: message };
  }

  return { allowed: true };
}
