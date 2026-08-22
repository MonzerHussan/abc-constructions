import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { tenantService } from "@/modules/platform/services/TenantService";
import {
  resolveCorrelationId,
  runWithRequestContext,
} from "@/modules/platform/context/request-context";
import type { PlatformPermission } from "@/modules/platform/security/platform-authorization";
import { enforcePlatformAccess } from "@/modules/platform/security/access-pipeline";
import { error } from "@/modules/shared/utils/response-envelope";
import { ErrorCodes } from "@/modules/shared/utils/error-codes";

export interface PlatformTenantContext {
  sessionUserId: string;
  tenantId: string;
  correlationId: string;
  roleKeys: string[];
  params: Record<string, string>;
}

type PlatformTenantHandler = (
  req: NextRequest,
  ctx: PlatformTenantContext
) => Promise<NextResponse> | NextResponse;

/**
 * VS-0 guard: Auth → Tenant membership → RBAC deny-default → SoD → RequestContext.
 * Missing/invalid tenant or permission returns 403 (deny-default).
 */
export function withPlatformTenant(
  permission: PlatformPermission | null,
  handler: PlatformTenantHandler
) {
  return async (
    req: NextRequest,
    { params }: { params: Promise<Record<string, string>> } = {
      params: Promise.resolve({}),
    }
  ): Promise<NextResponse> => {
    try {
      const session = await auth();
      const userId = session?.user?.id;
      if (!userId) {
        return NextResponse.json(
          error(ErrorCodes.CORE_USER_UNAUTHORIZED, "Authentication required"),
          { status: 401 }
        );
      }

      const tenantId = req.headers.get("x-tenant-id")?.trim();
      if (!tenantId) {
        return NextResponse.json(
          error(ErrorCodes.CORE_USER_FORBIDDEN, "X-Tenant-Id header required"),
          { status: 403 }
        );
      }

      const membership = await tenantService.assertMembership(userId, tenantId);
      if (!membership) {
        return NextResponse.json(
          error(ErrorCodes.CORE_USER_FORBIDDEN, "Tenant access denied"),
          { status: 403 }
        );
      }

      if (permission) {
        const access = enforcePlatformAccess(
          {
            userId,
            tenantId,
            roleKeys: membership.roleKeys,
          },
          permission,
          tenantId
        );
        if (!access.allowed) {
          return NextResponse.json(
            error(ErrorCodes.CORE_USER_FORBIDDEN, access.reason),
            { status: 403 }
          );
        }
      }

      const correlationId = resolveCorrelationId(
        req.headers.get("x-correlation-id")
      );
      const resolvedParams = await params;

      return runWithRequestContext(
        {
          correlationId,
          tenantId,
          userId,
          ipAddress:
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            undefined,
          userAgent: req.headers.get("user-agent") ?? undefined,
        },
        () =>
          handler(req, {
            sessionUserId: userId,
            tenantId,
            correlationId,
            roleKeys: membership.roleKeys,
            params: resolvedParams,
          })
      );
    } catch {
      return NextResponse.json(
        error(ErrorCodes.INTERNAL_ERROR, "Platform authorization failed"),
        { status: 500 }
      );
    }
  };
}
